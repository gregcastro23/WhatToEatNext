import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type HealthResponse = {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  dependencies: {
    name: string;
    status: 'ok' | 'error';
    version?: string;
  }[];
  timestamp: string;
  uptime: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  const startTime = process.uptime();
  
  // Check if critical data files exist
  const criticalDataFiles = [
    path.join(process.cwd(), 'src/data/cuisines.ts'),
    path.join(process.cwd(), 'src/data/recipes/elementalMappings.ts'),
    path.join(process.cwd(), 'src/data/cooking/cookingMethods.ts')
  ];

  // Get package.json for version information
  let packageJson: unknown = {};
  let packageJsonError = false;
  
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonContent = await fs.promises.readFile(packageJsonPath, 'utf8');
    packageJson = JSON.parse(packageJsonContent);
  } catch (error) {
    console.error('Error reading package.json:', error);
    packageJsonError = true;
  }

  // Check dependencies status
  const dependencies = [
    'next',
    'react',
    'react-dom',
    'ml-distance'
  ].map(dep => {
    try {
      // Try to import the dependency to verify it's installed correctly
      require.resolve(dep);
      
      return {
        name: dep,
        status: 'ok' as const,
        version: packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep] || 'unknown'
      };
    } catch (error) {
      return {
        name: dep,
        status: 'error' as const
      };
    }
  });

  // Check for data files
  const dataFileChecks = await Promise.all(
    criticalDataFiles.map(async (filePath) => {
      const fileName = path.basename(filePath);
      try {
        await fs.promises.access(filePath, fs.constants.R_OK);
        return {
          name: `data:${fileName}`,
          status: 'ok' as const
        };
      } catch (error) {
        return {
          name: `data:${fileName}`,
          status: 'error' as const
        };
      }
    })
  );

  // Combine dependency checks with data file checks
  const allChecks = [...dependencies, ...dataFileChecks];
  
  // Determine overall status
  const hasErrors = allChecks.some(check => check.status === 'error');
  const status = packageJsonError || hasErrors ? 'degraded' : 'ok';

  // Send response
  res.status(200).json({
    status,
    version: packageJson.version || 'unknown',
    dependencies: allChecks,
    timestamp: new Date().toISOString(),
    uptime: process.uptime() - startTime
  });
} 