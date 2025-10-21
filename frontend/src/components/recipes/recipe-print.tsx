'use client';

import type { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface Props {
  recipe: Recipe;
}

export function RecipePrintButton({ recipe }: Props) {
  const handlePrint = () => {
    // Create print window
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    // Build HTML
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${recipe.name} - PlateWise</title>
        <style>
          @media print {
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }
            .header {
              border-bottom: 2px solid #f97316;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .logo {
              color: #f97316;
              font-size: 24px;
              font-weight: bold;
            }
            h1 {
              font-size: 28px;
              margin: 20px 0 10px;
            }
            .meta {
              color: #666;
              margin-bottom: 20px;
              font-size: 14px;
            }
            h2 {
              font-size: 20px;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            ul, ol {
              margin-left: 20px;
            }
            li {
              margin-bottom: 8px;
              line-height: 1.5;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">PlateWise</div>
        </div>

        <h1>${recipe.name}</h1>
        ${recipe.description ? `<p>${recipe.description}</p>` : ''}

        <div class="meta">
          ${recipe.prep_time ? `<strong>Prep:</strong> ${recipe.prep_time}m &nbsp; ` : ''}
          ${recipe.cook_time ? `<strong>Cook:</strong> ${recipe.cook_time}m &nbsp; ` : ''}
          ${recipe.servings ? `<strong>Servings:</strong> ${recipe.servings}` : ''}
        </div>

        <h2>Ingredients</h2>
        <ul>
          ${recipe.ingredients
            .map(
              (ing) => `
            <li>
              ${[ing.quantity, ing.unit, ing.item].filter(Boolean).join(' ')}
              ${ing.notes ? ` (${ing.notes})` : ''}
            </li>
          `
            )
            .join('')}
        </ul>

        <h2>Instructions</h2>
        <ol>
          ${recipe.instructions
            .map((inst) => `<li>${inst.instruction}</li>`)
            .join('')}
        </ol>

        <div class="footer">
          <p><strong>Generated with PlateWise - AI Recipe Manager</strong></p>
          <p>Try PlateWise Free: Generate 4 AI Recipe Styles in 30 Seconds</p>
          <p>platewise.xyz</p>
          ${recipe.allergens && recipe.allergens.length > 0 ? `
            <p style="margin-top: 10px;"><strong>Allergens:</strong> ${recipe.allergens.join(', ')}</p>
          ` : ''}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Button onClick={handlePrint} variant="outline" size="sm">
      <Printer className="h-4 w-4 mr-2" />
      Print / Save as PDF
    </Button>
  );
}
