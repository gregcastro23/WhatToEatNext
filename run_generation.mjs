import fs from 'fs';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const missingIngredients = JSON.parse(fs.readFileSync('missing_ingredients.json', 'utf8'));

const batchSize = 10;
const BATCHES_TO_RUN = 100; // Large enough to finish everything

async function run() {
  const tsFilePath = './src/data/ingredients/ingredientSummaries.ts';
  let tsContent = fs.readFileSync(tsFilePath, 'utf8');
  
  let currentMissing = [...missingIngredients];
  
  for (let i = 0; i < BATCHES_TO_RUN; i++) {
    if (currentMissing.length === 0) {
      console.log('All missing ingredients processed!');
      break;
    }
    
    const batch = currentMissing.slice(0, batchSize);
    currentMissing = currentMissing.slice(batchSize);
    
    console.log(`Processing batch ${i + 1}/${BATCHES_TO_RUN}... (${batch.length} items)`);
    
    try {
      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          summaries: z.array(z.object({
            ingredient_name: z.string().describe("The exact name from the provided list."),
            summary: z.string().describe("A 3-4 sentence paragraph describing the ingredient (with italicized Latin species name if applicable), its culinary role, and its alchemical/culinary transformations. Followed by two newlines and a **Selection & Storage:** section explaining how to pick and store it.")
          }))
        }),
        prompt: `Write scientific and culinary summaries for the following ingredients:\n\n${batch.join(', ')}\n\nThe format for the summary must exactly match this example:\nA pungent bulb (*Allium sativum*) belonging to the onion genus, prized globally for its intense, savory flavor and aroma. When its cells are crushed or chopped, an enzyme reaction produces allicin, the compound responsible for its signature bite and potent antimicrobial properties. This sharpness mellows into a deep, sweet nuttiness when roasted or sautéed.\n\n**Selection & Storage:** Look for firm, heavy bulbs with dry, unbroken papery skins and no green shoots. Store in a cool, dark, and well-ventilated space, rather than the refrigerator, to prevent premature sprouting.`,
        temperature: 0.5
      });
      
      let insertion = '';
      for (const item of result.object.summaries) {
        if (!item.ingredient_name || !item.summary || item.ingredient_name.trim() === '') continue;
        // ensure quotes around keys
        const formattedKey = item.ingredient_name.toLowerCase().replace(/\s+/g, '_');
        insertion += `\n  "${formattedKey}": \`${item.summary.replace(/`/g, '\\`')}\`,\n`;
      }
      
      const lastBraceIndex = tsContent.lastIndexOf('};');
      if (lastBraceIndex !== -1) {
        let beforeBrace = tsContent.substring(0, lastBraceIndex).trimEnd();
        if (!beforeBrace.endsWith(',')) {
          beforeBrace += ',';
        }
        tsContent = beforeBrace + insertion + '\n};\n' + tsContent.substring(lastBraceIndex + 2);
        fs.writeFileSync(tsFilePath, tsContent);
        console.log(`Batch ${i + 1} appended successfully.`);
      }
      
      fs.writeFileSync('missing_ingredients.json', JSON.stringify(currentMissing, null, 2));
      
    } catch (error) {
      console.error(`Error processing batch ${i + 1}:`, error);
      break; 
    }
  }
}

run();