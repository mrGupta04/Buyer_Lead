import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { parse } from 'csv-parse/sync';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { CSVImportSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

  
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(csv|xlsx|xls)$/)) {
      return NextResponse.json(
        { error: 'Only CSV or Excel files are supported' },
        { status: 400 }
      );
    }

    const text = await file.text();

    // Check if file is empty
    if (!text.trim()) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      );
    }

    let records: any[];
    try {
      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
          // Handle empty values
          if (value === '' || value === null || value === undefined) {
            return null;
          }

          if (context.column === 'budgetMin' || context.column === 'budgetMax') {
            // Remove any non-numeric characters before parsing
            const numericValue = value.toString().replace(/[^\d]/g, '');
            return numericValue ? parseInt(numericValue) : null;
          }

          return value;
        }
      });
    } catch (parseError) {
      console.error('CSV Parse Error:', parseError);
      return NextResponse.json(
        { error: 'Invalid CSV format. Please check your file structure.' },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'No data found in CSV file' },
        { status: 400 }
      );
    }

    if (records.length > 200) {
      return NextResponse.json(
        { error: 'File contains more than 200 rows' },
        { status: 400 }
      );
    }

    const validationResults = [];
    const validRecords = [];

    for (let i = 0; i < records.length; i++) {
      try {
        // Clean up the record data before validation
        const cleanedRecord = { ...records[i] };

        // Ensure required fields are present
        if (!cleanedRecord.fullName || !cleanedRecord.phone) {
          throw new Error('Missing required fields: fullName and phone are required');
        }

        // Clean phone number - remove any non-digit characters
        if (cleanedRecord.phone) {
          cleanedRecord.phone = cleanedRecord.phone.toString().replace(/\D/g, '');
        }

        // Handle empty strings for optional fields
        Object.keys(cleanedRecord).forEach(key => {
          if (cleanedRecord[key] === '') {
            cleanedRecord[key] = null;
          }
        });
        
        // Ensure tags field exists
        if (!('tags' in cleanedRecord)) {
          cleanedRecord.tags = null;
        }

        const validated = CSVImportSchema.parse(cleanedRecord);
        validRecords.push(validated);
        validationResults.push({ row: i + 2, valid: true });
      } catch (error) {
        console.error(`Validation error at row ${i + 2}:`, error);
        validationResults.push({
          row: i + 2,
          valid: false,
          errors: error instanceof Error ? [error.message] :
            (error as z.ZodError)?.issues ? (error as z.ZodError).issues.map((issue: any) =>
              `${issue.path.join('.')}: ${issue.message}`
            ) :
              ['Unknown validation error']
        });
      }
    }

    // If there are validation errors, return them
    const errors = validationResults.filter(r => !r.valid);
    if (errors.length > 0) {
      return NextResponse.json({
        message: `${errors.length} records failed validation`,
        errors
      }, { status: 400 });
    }

    // FIXED: Process records in smaller batches to avoid transaction timeouts
    const BATCH_SIZE = 20;
    const imported = [];

    for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
      const batch = validRecords.slice(i, i + BATCH_SIZE);
      
      try {
        // Process each batch in its own transaction
        const batchResult = await prisma.$transaction(async (tx) => {
          const batchImported = [];
          
          for (const record of batch) {
            try {
              // Check if phone already exists
              const existing = await tx.buyer.findFirst({
                where: { phone: record.phone }
              });

              if (existing) {
                batchImported.push({
                  fullName: record.fullName,
                  phone: record.phone,
                  success: false,
                  error: 'Phone number already exists'
                });
                continue;
              }

              // Create the buyer record
              const buyer = await tx.buyer.create({
                data: {
                  fullName: record.fullName,
                  email: record.email || null,
                  phone: record.phone,
                  city: record.city || 'Chandigarh',
                  propertyType: record.propertyType || 'Apartment',
                  bhk: record.bhk || null,
                  purpose: record.purpose || 'Buy',
                  budgetMin: record.budgetMin || null,
                  budgetMax: record.budgetMax || null,
                  timeline: record.timeline || 'Exploring',
                  source: record.source || 'Other',
                  status: record.status || 'New',
                  notes: record.notes || null,
                  tags: record.tags || [],
                  ownerId: session.user.id,
                },
              });

              // Create history entry
              await tx.buyerHistory.create({
                data: {
                  buyerId: buyer.id,
                  changedBy: session.user.id,
                  action: 'IMPORT',
                  changes: JSON.stringify(record),
                },
              });

              batchImported.push({
                id: buyer.id,
                fullName: buyer.fullName,
                phone: buyer.phone,
                success: true
              });
            } catch (error) {
              console.error('Error creating buyer in batch:', error);
              batchImported.push({
                fullName: record.fullName,
                phone: record.phone,
                success: false,
                error: 'Failed to create record in batch'
              });
            }
          }
          
          return batchImported;
        }, {
          // Increase transaction timeout for larger batches
          timeout: 30000, // 30 seconds
          maxWait: 30000, // 30 seconds
        });
        
        imported.push(...batchResult);
      } catch (batchError) {
        console.error(`Batch ${Math.floor(i/BATCH_SIZE) + 1} failed:`, batchError);
        
        // Mark all records in this batch as failed
        batch.forEach(record => {
          imported.push({
            fullName: record.fullName,
            phone: record.phone,
            success: false,
            error: 'Batch processing failed'
          });
        });
      }
    }

    const successfulImports = imported.filter(r => r.success);
    const failedImports = imported.filter(r => !r.success);

    return NextResponse.json({
      message: `Imported ${successfulImports.length} of ${validRecords.length} records successfully`,
      importedCount: successfulImports.length,
      skippedCount: failedImports.length,
      imported: successfulImports,
      failed: failedImports
    });

  } catch (error) {
    console.error('Error importing CSV:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && 'code' in error && error.code === 'P2028') {
      return NextResponse.json(
        { error: 'Database transaction timeout. Please try again with a smaller file or contact support.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}