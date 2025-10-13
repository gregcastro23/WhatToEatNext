# Campaign Testing Infrastructure

This directory contains comprehensive testing infrastructure for the Perfect
Codebase Campaign system.

## Test Structure

### Unit Tests

- **CampaignController.test.ts**: Tests for campaign phase execution and
  management
- **SafetyProtocol.test.ts**: Tests for safety protocols, git operations, and
  corruption detection
- **ProgressTracker.test.ts**: Tests for progress tracking, metrics collection,
  and reporting

### Integration Tests

- **PhaseExecution.integration.test.ts**: End-to-end phase execution workflows
- **SafetyProtocol.integration.test.ts**: Safety protocol integration with
  corruption simulation
- **EndToEndCampaign.integration.test.ts**: Complete campaign execution
  scenarios

### Performance Tests

- **BuildPerformance.test.ts**: Build time validation and performance regression
  testing
- **MemoryUsage.test.ts**: Memory usage monitoring and leak detection
- **CacheHitRate.test.ts**: Cache performance validation and optimization
  testing
- **BundleSize.test.ts**: Bundle size regression testing and optimization
  validation

### Mock Infrastructure

- ****mocks**/GitOperationsMock.ts**: Mock git operations for testing
- ****mocks**/ScriptExecutionMock.ts**: Mock script execution for testing
- **setup.ts**: Test setup and utilities

## Running Tests

### All Tests

```bash
npm test
```

### Unit Tests Only

```bash
npm test -- --testPathPattern="__tests__.*\.test\.ts$"
```

### Integration Tests Only

```bash
npm test -- --testPathPattern="integration"
```

### Performance Tests Only

```bash
npm test -- --testPathPattern="performance"
```

### With Coverage

```bash
npm test -- --coverage
```

## Test Configuration

### Jest Configuration

- **jest.config.js**: Main Jest configuration with project-specific settings
- **globalSetup.js**: Global test setup and environment configuration
- **globalTeardown.js**: Global test cleanup and resource management

### Coverage Requirements

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Test Categories

### 1. Unit Tests

Focus on individual component functionality:

- Component initialization and configuration
- Method behavior and return values
- Error handling and edge cases
- Mock integration and dependency injection

### 2. Integration Tests

Test component interactions:

- Phase execution workflows
- Safety protocol integration
- Progress tracking across components
- End-to-end campaign scenarios

### 3. Performance Tests

Validate performance requirements:

- Build time under 10 seconds
- Memory usage under 50MB
- Cache hit rate above 80%
- Bundle size under 420kB

## Mock System

### Git Operations Mock

Simulates git operations without actual git commands:

- Stash creation and application
- Branch management
- Status checking
- Error scenarios

### Script Execution Mock

Simulates script execution without running actual scripts:

- Tool execution results
- Batch processing
- Build and test validation
- Performance metrics

## Test Utilities

### Custom Matchers

- `toBeWithinRange(floor, ceiling)`: Validates numeric ranges
- `toHaveBeenCalledWithScript(scriptPath)`: Validates script execution

### Helper Functions

- `createMockCorruptedFile(content)`: Creates corrupted file content
- `createMockTypeScriptErrors(count)`: Generates mock TypeScript errors
- `createMockLintingWarnings(count)`: Generates mock linting warnings
- `createMockProgressMetrics(overrides)`: Creates mock progress metrics

## Performance Testing

### Build Performance

- Validates build time under 10-second target
- Tests build time consistency and regression detection
- Benchmarks TypeScript compilation and linting performance

### Memory Usage

- Monitors memory usage under 50MB target
- Detects memory leaks and inefficient allocation patterns
- Tests memory cleanup in long-running operations

### Cache Performance

- Validates cache hit rate above 80% target
- Tests cache warming and invalidation scenarios
- Benchmarks cache lookup performance

### Bundle Size

- Validates bundle size under 420kB target
- Tests bundle optimization strategies
- Monitors bundle size regression over time

## Safety Testing

### Corruption Simulation

- Git merge conflict simulation
- Import/export corruption patterns
- Syntax corruption detection
- File system error scenarios

### Recovery Testing

- Automatic rollback validation
- Emergency recovery procedures
- Stash management and cleanup
- Real-time monitoring scenarios

## Best Practices

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Clean up resources in afterEach hooks

### Mock Usage

- Reset mocks between tests
- Use specific mock implementations for each test
- Verify mock calls and parameters
- Avoid over-mocking

### Performance Testing

- Use realistic test data sizes
- Measure actual performance metrics
- Test under various load conditions
- Validate performance regression detection

### Error Testing

- Test both success and failure scenarios
- Validate error messages and types
- Test error recovery mechanisms
- Ensure graceful degradation

## Continuous Integration

The test suite is designed to run in CI/CD environments with:

- Parallel test execution for faster feedback
- Comprehensive coverage reporting
- Performance regression detection
- Automatic test result reporting

## Troubleshooting

### Common Issues

- **Timeout errors**: Increase test timeout for performance tests
- **Mock conflicts**: Ensure mocks are reset between tests
- **Memory issues**: Use `--maxWorkers=1` for performance tests
- **Async issues**: Properly await async operations

### Debug Mode

Run tests with additional debugging:

```bash
npm test -- --verbose --detectOpenHandles
```

### Coverage Issues

Generate detailed coverage report:

```bash
npm test -- --coverage --coverageReporters=html
```

This testing infrastructure ensures the Perfect Codebase Campaign system is
thoroughly tested, performant, and reliable across all scenarios.
