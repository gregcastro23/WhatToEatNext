/**
 * Terminal Freeze Prevention System
 * 
 * Prevents Kiro terminal from freezing by implementing:
 * - Command timeouts
 * - Process monitoring
 * - Infinite loop detection
 * - Resource usage limits
 */

import { execSync, spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface ProcessMonitorConfig {
  maxExecutionTime: number; // milliseconds
  maxMemoryUsage: number; // MB
  heartbeatInterval: number; // milliseconds
  killOnTimeout: boolean;
}

export interface ProcessStatus {
  pid: number;
  command: string;
  startTime: Date;
  isRunning: boolean;
  memoryUsage: number;
  cpuUsage: number;
  hasTimedOut: boolean;
}

export class TerminalFreezePreventionSystem {
  private runningProcesses: Map<number, ProcessStatus> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly DEFAULT_CONFIG: ProcessMonitorConfig = {
    maxExecutionTime: 60000, // 1 minute
    maxMemoryUsage: 500, // 500MB
    heartbeatInterval: 5000, // 5 seconds
    killOnTimeout: true
  };

  constructor(private config: ProcessMonitorConfig = {} as ProcessMonitorConfig) {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
    this.startMonitoring();
  }

  /**
   * Execute command with timeout and monitoring
   */
  async safeExecSync(command: string, options: any = {}): Promise<string> {
    const safeOptions = {
      ...options,
      timeout: options.timeout || this.config.maxExecutionTime,
      encoding: 'utf8' as const,
      stdio: 'pipe' as const
    };

    try {
      console.log(`🔧 Executing with timeout (${safeOptions.timeout}ms): ${command}`);
      const output = execSync(command, safeOptions);
      return output.toString();
    } catch (error: any) {
      if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT') {
        console.warn(`⏰ Command timed out after ${safeOptions.timeout}ms: ${command}`);
        throw new Error(`Command timeout: ${command}`);
      }
      throw error;
    }
  }

  /**
   * Spawn process with monitoring
   */
  async safeSpawn(command: string, args: string[] = [], options: any = {}): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        ...options,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const processStatus: ProcessStatus = {
        pid: child.pid!,
        command: `${command} ${args.join(' ')}`,
        startTime: new Date(),
        isRunning: true,
        memoryUsage: 0,
        cpuUsage: 0,
        hasTimedOut: false
      };

      this.runningProcesses.set(child.pid!, processStatus);

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Set timeout
      const timeout = setTimeout(() => {
        if (child.pid && this.runningProcesses.has(child.pid)) {
          console.warn(`⏰ Process timed out, killing PID ${child.pid}`);
          processStatus.hasTimedOut = true;
          child.kill('SIGTERM');
          
          // Force kill after 5 seconds if still running
          setTimeout(() => {
            if (child.pid && this.runningProcesses.has(child.pid)) {
              child.kill('SIGKILL');
            }
          }, 5000);
        }
      }, this.config.maxExecutionTime);

      child.on('close', (code) => {
        clearTimeout(timeout);
        processStatus.isRunning = false;
        this.runningProcesses.delete(child.pid!);

        if (processStatus.hasTimedOut) {
          reject(new Error(`Process timeout: ${processStatus.command}`));
        } else {
          resolve({
            stdout,
            stderr,
            exitCode: code || 0
          });
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        processStatus.isRunning = false;
        this.runningProcesses.delete(child.pid!);
        reject(error);
      });
    });
  }

  /**
   * Start monitoring running processes
   */
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.checkRunningProcesses();
    }, this.config.heartbeatInterval);

    console.log(`🔍 Started process monitoring (interval: ${this.config.heartbeatInterval}ms)`);
  }

  /**
   * Check all running processes for timeouts and resource usage
   */
  private checkRunningProcesses(): void {
    const now = new Date();

    for (const [pid, status] of this.runningProcesses.entries()) {
      const runTime = now.getTime() - status.startTime.getTime();

      // Check for timeout
      if (runTime > this.config.maxExecutionTime && !status.hasTimedOut) {
        console.warn(`⚠️  Process ${pid} has been running for ${runTime}ms (${status.command})`);
        
        if (this.config.killOnTimeout) {
          this.killProcess(pid, 'timeout');
        }
      }

      // Check memory usage
      this.updateProcessStats(pid);
      if (status.memoryUsage > this.config.maxMemoryUsage) {
        console.warn(`⚠️  Process ${pid} using ${status.memoryUsage}MB memory (${status.command})`);
        
        if (this.config.killOnTimeout) {
          this.killProcess(pid, 'memory');
        }
      }
    }
  }

  /**
   * Update process statistics
   */
  private updateProcessStats(pid: number): void {
    try {
      const stats = execSync(`ps -o pid,vsz,rss,pcpu -p ${pid} | tail -1`, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 5000
      });

      const [, , rss, pcpu] = stats.trim().split(/\s+/);
      const status = this.runningProcesses.get(pid);
      
      if (status) {
        status.memoryUsage = parseInt(rss) / 1024; // Convert KB to MB
        status.cpuUsage = parseFloat(pcpu);
      }
    } catch (error) {
      // Process might have ended, ignore error
    }
  }

  /**
   * Kill a process
   */
  private killProcess(pid: number, reason: string): void {
    try {
      console.warn(`🛑 Killing process ${pid} (reason: ${reason})`);
      process.kill(pid, 'SIGTERM');
      
      const status = this.runningProcesses.get(pid);
      if (status) {
        status.hasTimedOut = true;
      }

      // Force kill after 5 seconds
      setTimeout(() => {
        try {
          process.kill(pid, 'SIGKILL');
          this.runningProcesses.delete(pid);
        } catch (error) {
          // Process already dead
        }
      }, 5000);
    } catch (error) {
      console.warn(`Failed to kill process ${pid}:`, (error as Error).message);
    }
  }

  /**
   * Get status of all running processes
   */
  getRunningProcesses(): ProcessStatus[] {
    return Array.from(this.runningProcesses.values());
  }

  /**
   * Kill all monitored processes
   */
  killAllProcesses(): void {
    console.log(`🛑 Killing ${this.runningProcesses.size} monitored processes`);
    
    for (const pid of this.runningProcesses.keys()) {
      this.killProcess(pid, 'shutdown');
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.killAllProcesses();
    console.log('🔍 Stopped process monitoring');
  }

  /**
   * Check for infinite loops in campaign systems
   */
  async detectInfiniteLoops(): Promise<{
    detected: boolean;
    suspiciousProcesses: ProcessStatus[];
    recommendations: string[];
  }> {
    const suspiciousProcesses: ProcessStatus[] = [];
    const recommendations: string[] = [];
    
    const now = new Date();
    
    for (const status of this.runningProcesses.values()) {
      const runTime = now.getTime() - status.startTime.getTime();
      
      // Process running longer than 5 minutes is suspicious
      if (runTime > 300000) {
        suspiciousProcesses.push(status);
        
        if (status.command.includes('tsc') || status.command.includes('lint')) {
          recommendations.push(`TypeScript/Lint process stuck: ${status.command}`);
        }
        
        if (status.command.includes('campaign') || status.command.includes('batch')) {
          recommendations.push(`Campaign process may be in infinite loop: ${status.command}`);
        }
      }
    }
    
    return {
      detected: suspiciousProcesses.length > 0,
      suspiciousProcesses,
      recommendations
    };
  }

  /**
   * Emergency stop all campaign processes
   */
  async emergencyStop(): Promise<void> {
    console.log('🚨 EMERGENCY STOP: Killing all processes');
    
    // Kill all monitored processes
    this.killAllProcesses();
    
    // Kill any remaining TypeScript/lint processes
    try {
      execSync('pkill -f "tsc --noEmit"', { stdio: 'ignore', timeout: 5000 });
      execSync('pkill -f "yarn lint"', { stdio: 'ignore', timeout: 5000 });
      execSync('pkill -f "campaign"', { stdio: 'ignore', timeout: 5000 });
    } catch (error) {
      // Ignore errors, processes might not exist
    }
    
    console.log('🚨 Emergency stop completed');
  }
}

// Global instance for easy access
export const terminalFreezePreventionSystem = new TerminalFreezePreventionSystem();

// Cleanup on process exit
process.on('exit', () => {
  terminalFreezePreventionSystem.stopMonitoring();
});

process.on('SIGINT', () => {
  terminalFreezePreventionSystem.emergencyStop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  terminalFreezePreventionSystem.emergencyStop();
  process.exit(0);
});