# [Astrological Feature Name] Specification

## Introduction

[Provide a clear description of the astrological feature and its role within the WhatToEatNext system. Explain how this feature integrates with the four-element system (Fire, Water, Earth, Air) and supports the mission of bridging ancient astrological wisdom with modern AI technology.]

### Feature Overview
- **Feature Type**: [Astrological Calculation | Planetary Integration | Elemental System | Cosmic Timing]
- **Astrological Domain**: [Planetary Positions | Elemental Harmony | Seasonal Cycles | Lunar Phases]
- **Priority**: [High | Medium | Low]
- **Complexity**: [Simple | Moderate | Complex | Astronomical]
- **Estimated Timeline**: [X weeks/months]

### Astrological Context
[Explain the astrological principles underlying this feature, referencing the 14 Alchemical Pillars and elemental self-reinforcement principles. Describe how this feature aligns with cosmic timing and planetary influences.]

### Integration with Existing Systems
[Describe how this feature integrates with existing astrological calculations, the campaign system, and the broader WhatToEatNext architecture.]

## Astrological Requirements

### Requirement 1: [Planetary Position Integration]

**User Story:** As a user seeking cosmic alignment, I want [astrological feature], so that [cosmic benefit and enhanced harmony].

#### Acceptance Criteria

1. WHEN [astronomical condition] THEN [system] SHALL [astrological response with specific planetary consideration]
2. WHEN planetary positions change THEN [system] SHALL [update recommendations within specified timeframe]
3. IF [planetary calculation fails] THEN [system] SHALL [use validated fallback positions from March 28, 2025]
4. WHEN [retrograde motion detected] THEN [system] SHALL [adjust calculations according to retrograde principles]
5. IF [transit validation fails] THEN [system] SHALL [implement graceful degradation with cached data]
### Re
quirement 2: [Elemental Harmony Calculations]

**User Story:** As a user seeking elemental balance, I want [elemental feature], so that [harmony benefit and self-reinforcement].

#### Acceptance Criteria

1. WHEN [elemental properties calculated] THEN [system] SHALL [follow self-reinforcement principles with same-element affinity ≥0.9]
2. WHEN [different elements combined] THEN [system] SHALL [maintain minimum compatibility of 0.7]
3. IF [elemental validation required] THEN [system] SHALL [verify Fire/Water/Earth/Air values are non-negative]
4. WHEN [dominant element identified] THEN [system] SHALL [enhance recommendations for self-reinforcement]
5. IF [elemental calculation error] THEN [system] SHALL [use default balanced properties]

### Requirement 3: [Astronomical Timing and Seasonal Adaptation]

**User Story:** As a user following cosmic rhythms, I want [timing feature], so that [optimal cosmic alignment and seasonal harmony].

#### Acceptance Criteria

1. WHEN [astronomical season changes] THEN [system] SHALL [adapt recommendations within 24 hours]
2. WHEN [lunar phase transitions] THEN [system] SHALL [update lunar influence calculations]
3. IF [eclipse period detected] THEN [system] SHALL [apply special eclipse considerations]
4. WHEN [planetary ingress occurs] THEN [system] SHALL [recalculate affected recommendations]
5. IF [astronomical data unavailable] THEN [system] SHALL [use cached seasonal patterns]

### Requirement 4: [Cultural and Culinary Integration]

**User Story:** As a user with cultural preferences, I want [culturally-aware astrological feature], so that [respectful cosmic guidance honoring traditions].

#### Acceptance Criteria

1. WHEN [cultural cuisine selected] THEN [system] SHALL [integrate astrological principles respectfully]
2. WHEN [dietary restrictions applied] THEN [system] SHALL [maintain astrological harmony within constraints]
3. IF [cultural conflict with cosmic timing] THEN [system] SHALL [provide balanced recommendations]
4. WHEN [traditional ingredients used] THEN [system] SHALL [honor authentic preparation while adding cosmic timing]
5. IF [cultural sensitivity required] THEN [system] SHALL [avoid assumptions about astrological beliefs]

### Requirement 5: [Performance and Reliability for Astronomical Calculations]

**User Story:** As a user depending on accurate cosmic guidance, I want [reliable astrological calculations], so that [trustworthy cosmic recommendations].

#### Acceptance Criteria

1. WHEN [astronomical calculations performed] THEN [system] SHALL [complete within 2 seconds maximum]
2. WHEN [API calls to astronomical services] THEN [system] SHALL [timeout after 5 seconds with fallback]
3. IF [calculation accuracy required] THEN [system] SHALL [maintain planetary position accuracy within 0.1 degrees]
4. WHEN [multiple data sources available] THEN [system] SHALL [validate consistency and prefer NASA JPL data]
5. IF [system performance degrades] THEN [system] SHALL [maintain acceptable response times through caching]

## Astronomical Considerations

### Planetary Position Requirements
[Specify requirements for planetary calculations, including:]
- Primary data sources (NASA JPL Horizons, Swiss Ephemeris)
- Accuracy requirements (±0.1 degrees for positions)
- Update frequencies and caching strategies
- Fallback mechanisms for API failures

### Transit Date Validation
[Define transit validation requirements, including:]
- Validation against stored transit dates in `/src/data/planets/`
- Handling of retrograde phases and sign changes
- Edge case management for planetary ingresses
- Error handling for invalid date ranges

### Astronomical Edge Cases
[Address special astronomical conditions, including:]
- Eclipse periods and their special considerations
- Retrograde motion effects on calculations
- Planetary conjunctions and their intensified influences
- Lunar node calculations and karmic implications
- Sign boundary transitions and ingress timing

## Design Considerations

### Astrological Architecture
[Describe the astrological technical approach, including:]
- Integration with existing astronomical calculation systems
- Elemental harmony calculation methods
- Planetary influence weighting algorithms
- Fallback mechanisms for calculation failures

### Cosmic User Interface Design
[Describe the astrological UI/UX approach, including:]
- Visual representation of elemental properties
- Planetary position displays and timing indicators
- Seasonal adaptation of interface elements
- Cultural sensitivity in astrological presentation

### Astronomical Data Management
[Describe astrological data handling, including:]
- Planetary position caching strategies
- Transit date storage and validation
- Real-time astronomical data integration
- Fallback position management (March 28, 2025 data)

### Elemental Performance Requirements
[Specify astrological performance criteria, including:]
- Calculation speed requirements (<2 seconds)
- API timeout handling (5 seconds maximum)
- Cache hit rate optimization (>80%)
- Memory usage for astronomical calculations

## Implementation Plan

### Phase 1: Astronomical Foundation
- [ ] 1.1 Set up astronomical calculation infrastructure
  - Integrate with reliable astronomy utilities
  - Configure planetary position data sources
  - Implement fallback mechanisms
  - _Requirements: [Reference specific astrological requirements]_

- [ ] 1.2 Implement elemental harmony calculations
  - Create four-element system calculations
  - Implement self-reinforcement principles
  - Add compatibility scoring algorithms
  - _Requirements: [Reference specific elemental requirements]_

### Phase 2: Astrological Integration
- [ ] 2.1 Integrate planetary influence calculations
  - Connect to real-time planetary position services
  - Implement transit date validation
  - Add retrograde motion handling
  - _Requirements: [Reference specific planetary requirements]_

- [ ] 2.2 Create astrological user interface components
  - Build planetary position displays
  - Implement elemental property visualizations
  - Add seasonal adaptation interfaces
  - _Requirements: [Reference specific UI requirements]_

### Phase 3: Cultural and Timing Integration
- [ ] 3.1 Implement cultural sensitivity features
  - Add respectful astrological presentation
  - Integrate with diverse culinary traditions
  - Implement dietary restriction compatibility
  - _Requirements: [Reference specific cultural requirements]_

- [ ] 3.2 Add cosmic timing optimization
  - Implement optimal timing calculations
  - Add lunar phase integration
  - Create seasonal adaptation algorithms
  - _Requirements: [Reference specific timing requirements]_

### Phase 4: Testing and Validation
- [ ] 4.1 Implement comprehensive astrological testing
  - Create unit tests for astronomical calculations
  - Add integration tests for elemental harmony
  - Implement edge case testing for astronomical events
  - _Requirements: [Reference specific testing requirements]_

- [ ] 4.2 Performance optimization and monitoring
  - Optimize calculation speed and accuracy
  - Add performance monitoring for astronomical operations
  - Implement caching strategies for planetary data
  - _Requirements: [Reference specific performance requirements]_

## Testing Strategy

### Astronomical Calculation Testing
- Test planetary position accuracy against known ephemeris data
- Validate elemental compatibility calculations
- Ensure proper handling of retrograde motion
- Test fallback mechanisms for API failures

### Elemental Harmony Testing
- Validate self-reinforcement principles (same elements ≥0.9 compatibility)
- Test cross-element compatibility (different elements ≥0.7 compatibility)
- Ensure no opposing element logic is implemented
- Validate elemental property calculations

### Cultural Integration Testing
- Test respectful integration with diverse culinary traditions
- Validate dietary restriction compatibility
- Ensure cultural sensitivity in astrological presentations
- Test accessibility across different cultural contexts

### Performance Testing
- Validate calculation speed requirements (<2 seconds)
- Test API timeout handling and fallback mechanisms
- Ensure memory usage stays within acceptable limits
- Test caching effectiveness for astronomical data

## Success Criteria

### Functional Success Criteria
- [ ] All astrological calculations are accurate within specified tolerances
- [ ] Elemental harmony principles are properly implemented
- [ ] Cultural integration is respectful and inclusive
- [ ] Astronomical edge cases are handled gracefully

### Technical Success Criteria
- [ ] Performance requirements are met consistently
- [ ] Fallback mechanisms work reliably
- [ ] Caching strategies optimize response times
- [ ] Integration with existing systems is seamless

### User Experience Success Criteria
- [ ] Astrological features are accessible and understandable
- [ ] Cultural sensitivity is maintained throughout
- [ ] Cosmic timing recommendations are helpful and accurate
- [ ] User feedback on astrological features is positive

## Risk Assessment and Mitigation

### Astronomical Data Risks
- **Risk**: API failures for planetary position data
  - **Impact**: High
  - **Probability**: Medium
  - **Mitigation**: Implement robust fallback mechanisms with cached data

### Cultural Sensitivity Risks
- **Risk**: Misrepresentation of astrological traditions
  - **Impact**: High
  - **Probability**: Low
  - **Mitigation**: Extensive cultural sensitivity review and testing

### Performance Risks
- **Risk**: Slow astronomical calculations affecting user experience
  - **Impact**: Medium
  - **Probability**: Low
  - **Mitigation**: Optimize calculations and implement effective caching

## Dependencies and Prerequisites

### Astronomical Dependencies
- Reliable astronomy utility functions
- Planetary position data sources (NASA JPL, Swiss Ephemeris)
- Transit date validation data
- Fallback position data (March 28, 2025)

### System Dependencies
- Existing elemental harmony calculation systems
- Four-element system implementation
- Cultural cuisine integration systems
- Performance monitoring infrastructure

### Team Dependencies
- Astrological domain knowledge
- Cultural sensitivity expertise
- Astronomical calculation validation
- Performance optimization skills

## Maintenance and Support

### Ongoing Astronomical Maintenance
- Regular updates to planetary position data
- Validation of astronomical calculation accuracy
- Monitoring of API service reliability
- Updates to transit date information

### Cultural Sensitivity Maintenance
- Regular review of cultural integration approaches
- Updates based on user feedback and cultural guidance
- Monitoring for cultural sensitivity issues
- Continuous improvement of inclusive design

---

**Template Version**: 1.0  
**Last Updated**: [Date]  
**Template Author**: Kiro Optimization Team  
**Review Status**: [Draft | Review | Approved]
- Planetary conjunctions and their intensified influences
- Retrograde motion effects on calculations
- Lunar node calculations and karmic implications### 
Coordinate Systems and Precision
[Specify technical astronomical requirements, including:]
- Coordinate system conversions (ecliptic, equatorial)
- Precision requirements for different calculation types
- Time zone handling and UTC conversions
- Ephemeris data sources and validation

## Elemental Factors

### Four-Element System Integration
[Define how the feature integrates with elemental principles:]

#### Fire Element Considerations
- Energy and transformation aspects
- Quick cooking methods and spicy ingredients
- Planetary correspondences (Mars, Sun)
- Self-reinforcement with other Fire elements

#### Water Element Considerations
- Cooling and nourishing aspects
- Fluid-rich ingredients and steaming methods
- Planetary correspondences (Moon, Neptune)
- Emotional and intuitive cooking approaches

#### Earth Element Considerations
- Grounding and stability aspects
- Root vegetables and slow cooking methods
- Planetary correspondences (Saturn, Venus)
- Practical and sustainable food choices

#### Air Element Considerations
- Light and clarity aspects
- Leafy greens and raw preparations
- Planetary correspondences (Mercury, Uranus)
- Mental clarity and communication enhancement

### Elemental Compatibility Calculations
[Specify elemental harmony requirements:]
- Same-element combinations: ≥0.9 compatibility
- Different-element combinations: ≥0.7 compatibility
- No opposing elements (all combinations positive)
- Self-reinforcement principle implementation

### Elemental Validation and Testing
[Define validation requirements for elemental calculations:]
- Property validation (non-negative values)
- Total elemental strength limits
- Dominant element identification
- Compatibility score validation

## Planetary Timing and Seasonal Adaptation

### Seasonal Astronomical Cycles
[Define seasonal adaptation requirements:]

#### Spring Equinox Considerations
- Fresh, cleansing foods emphasis
- Air and Water element prominence
- Renewal and growth themes
- Detoxification support

#### Summer Solstice Considerations
- Cooling, hydrating foods emphasis
- Water and Earth element prominence
- Peak energy and vitality themes
- Heat management and cooling

#### Autumn Equinox Considerations
- Grounding, harvesting foods emphasis
- Earth and Fire element prominence
- Preparation and preservation themes
- Immune system support

#### Winter Solstice Considerations
- Warming, nourishing foods emphasis
- Fire and Air element prominence
- Conservation and reflection themes
- Deep nourishment and comfort### Lun
ar Phase Integration
[Specify lunar cycle considerations:]
- New Moon: Detoxifying and cleansing focus
- Waxing Moon: Building and nourishing emphasis
- Full Moon: Balancing and harmonizing approach
- Waning Moon: Releasing and purifying support

### Planetary Transit Effects
[Define how planetary transits affect recommendations:]
- Major planet sign changes and their impacts
- Retrograde periods and their modifications
- Conjunction and aspect influences
- Personal chart integration considerations

## Performance and Reliability Criteria

### Astronomical Calculation Performance
[Specify performance requirements specific to astrological calculations:]

#### Response Time Requirements
- Planetary position calculations: <1 second
- Elemental compatibility calculations: <500ms
- Seasonal adaptation calculations: <2 seconds
- Complete astrological recommendation: <3 seconds

#### Accuracy Requirements
- Planetary positions: ±0.1 degrees
- Lunar phases: ±1 hour
- Transit timing: ±1 day
- Elemental calculations: ±0.01 compatibility points

#### Reliability Requirements
- API availability: 99.5% uptime expectation
- Fallback activation: <5 second timeout
- Cache hit rate: >80% for repeated calculations
- Error recovery: <10 second maximum downtime

### Data Freshness and Caching
[Define data management requirements:]
- Planetary position cache: 6 hours maximum age
- Transit date updates: Monthly or on astronomical events
- Seasonal calculation cache: 24 hours maximum age
- Lunar phase cache: 12 hours maximum age

### Fallback and Error Handling
[Specify robust error handling for astronomical features:]
- Multi-tier fallback strategy (API → Cache → Local → Hardcoded)
- Graceful degradation with user notification
- Automatic recovery mechanisms
- Error logging and monitoring

## Implementation Plan

### Phase 1: Astronomical Foundation
- [ ] 1.1 Implement core astronomical calculation utilities
  - Set up reliable planetary position calculations using astronomy-engine
  - Implement transit date validation against stored data
  - Create fallback mechanisms with March 28, 2025 positions
  - Add comprehensive error handling and logging
  - _Requirements: 1.1, 1.2, 5.1_

- [ ] 1.2 Create elemental calculation system
  - Implement four-element compatibility calculations
  - Add self-reinforcement principle enforcement
  - Create elemental property validation functions
  - Build dominant element identification logic
  - _Requirements: 2.1, 2.2, 2.3_

### Phase 2: Seasonal and Timing Integration
- [ ] 2.1 Implement seasonal adaptation system
  - Create astronomical season detection and calculation
  - Build seasonal recommendation adjustment algorithms
  - Add lunar phase integration and timing
  - Implement eclipse and special event handling
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 2.2 Add planetary transit monitoring
  - Implement real-time transit detection
  - Create planetary ingress notification system
  - Add retrograde motion detection and handling
  - Build conjunction and aspect calculation
  - _Requirements: 3.4, 3.5_#
## Phase 3: Cultural Integration and User Experience
- [ ] 3.1 Implement culturally-sensitive astrological guidance
  - Create respectful cultural integration patterns
  - Add dietary restriction compatibility with cosmic timing
  - Implement traditional ingredient cosmic enhancement
  - Build inclusive astrological explanation system
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 3.2 Create user interface for astrological features
  - Build intuitive astrological information display
  - Add progressive disclosure for cosmic complexity
  - Implement visual elemental harmony indicators
  - Create cosmic timing guidance interface
  - _Requirements: 4.4, 4.5_

### Phase 4: Performance Optimization and Testing
- [ ] 4.1 Optimize astronomical calculation performance
  - Implement intelligent caching strategies
  - Add performance monitoring and metrics
  - Optimize calculation algorithms for speed
  - Create load balancing for astronomical APIs
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4.2 Comprehensive astrological testing
  - Create unit tests for all astronomical calculations
  - Add integration tests for elemental systems
  - Implement edge case testing for astronomical events
  - Build performance and reliability test suites
  - _Requirements: 5.4, 5.5_

## Testing Strategy for Astrological Features

### Astronomical Calculation Testing
[Define testing approaches for astronomical features:]

#### Unit Testing
- Planetary position calculation accuracy
- Transit date validation logic
- Elemental compatibility calculations
- Seasonal adaptation algorithms

#### Integration Testing
- API integration with astronomical services
- Fallback mechanism activation and recovery
- Cache invalidation and refresh cycles
- Cross-system astrological data consistency

#### Edge Case Testing
- Eclipse period handling
- Planetary retrograde motion effects
- Sign change and ingress timing
- Leap year and calendar edge cases

#### Performance Testing
- Calculation speed under various loads
- API timeout and fallback performance
- Cache hit rates and efficiency
- Memory usage for astronomical data

### Astrological Accuracy Validation
[Define validation approaches for astrological correctness:]

#### Historical Validation
- Compare calculations against known historical events
- Validate transit dates against astronomical records
- Test retrograde periods against ephemeris data
- Verify seasonal timing against astronomical calendars

#### Cross-Reference Validation
- Compare results with multiple astronomical sources
- Validate against Swiss Ephemeris calculations
- Cross-check with NASA JPL Horizons data
- Verify lunar calculations against multiple sources

#### Elemental Logic Validation
- Test self-reinforcement principle implementation
- Validate compatibility score calculations
- Verify no opposing element logic exists
- Test dominant element identification accuracy## Succ
ess Criteria for Astrological Features

### Functional Success Criteria
- [ ] All astronomical calculations meet accuracy requirements (±0.1 degrees)
- [ ] Elemental harmony follows self-reinforcement principles consistently
- [ ] Seasonal adaptations respond to astronomical changes within 24 hours
- [ ] Cultural integration respects diverse traditions while providing cosmic guidance
- [ ] Performance requirements met for all astrological calculations

### Technical Success Criteria
- [ ] API integration robust with <5 second timeout and reliable fallbacks
- [ ] Caching strategy maintains data freshness while optimizing performance
- [ ] Error handling provides graceful degradation without system failures
- [ ] Code quality meets project standards with comprehensive test coverage
- [ ] Documentation complete for all astrological calculation methods

### User Experience Success Criteria
- [ ] Astrological guidance enhances user satisfaction (>85% positive feedback)
- [ ] Cosmic timing recommendations improve meal planning effectiveness
- [ ] Elemental harmony suggestions increase user engagement with recommendations
- [ ] Cultural sensitivity maintained while providing meaningful astrological insights
- [ ] Progressive disclosure allows users to engage at their comfort level

### Astrological Accuracy Success Criteria
- [ ] Planetary positions accurate within ±0.1 degrees of reference ephemeris
- [ ] Transit timing accurate within ±1 day of astronomical events
- [ ] Lunar phase calculations accurate within ±1 hour
- [ ] Seasonal transitions detected and applied within ±6 hours
- [ ] Elemental calculations consistent with established astrological principles

## Risk Assessment for Astrological Features

### Astronomical Data Risks
- **Risk**: External astronomical API failures or inaccuracies
  - **Impact**: High - Affects core astrological functionality
  - **Probability**: Medium - APIs can have outages or data issues
  - **Mitigation**: Multi-tier fallback system with local data and multiple sources

- **Risk**: Calculation accuracy degradation over time
  - **Impact**: High - Undermines user trust in astrological guidance
  - **Probability**: Low - With proper validation and monitoring
  - **Mitigation**: Regular validation against reference sources and automated monitoring

### Cultural Sensitivity Risks
- **Risk**: Misrepresentation of astrological traditions or cultural practices
  - **Impact**: High - Could alienate users and damage reputation
  - **Probability**: Medium - Without careful cultural consultation
  - **Mitigation**: Cultural sensitivity review, inclusive design practices, user feedback integration

- **Risk**: Assumptions about user astrological beliefs or knowledge
  - **Impact**: Medium - Could create barriers to adoption
  - **Probability**: Medium - Without inclusive design approach
  - **Mitigation**: Progressive disclosure, optional astrological features, respectful language

### Technical Performance Risks
- **Risk**: Astronomical calculations causing performance bottlenecks
  - **Impact**: Medium - Affects user experience and system responsiveness
  - **Probability**: Medium - Complex calculations can be resource-intensive
  - **Mitigation**: Caching strategies, calculation optimization, performance monitoring

- **Risk**: Memory usage growth from astronomical data caching
  - **Impact**: Medium - Could affect system stability over time
  - **Probability**: Low - With proper cache management
  - **Mitigation**: Cache size limits, automatic cleanup, memory monitoring## Depe
ndencies and Prerequisites

### Astronomical Data Dependencies
- **NASA JPL Horizons API** - Primary source for planetary positions
- **Swiss Ephemeris Library** - Secondary calculation source
- **TimeAndDate.com API** - Tertiary astronomical data source
- **Local Ephemeris Data** - Fallback astronomical calculations

### Technical Dependencies
- **astronomy-engine** - Core astronomical calculation library
- **astronomia** - Additional astronomical computation support
- **date-fns** - Date and time manipulation for astronomical timing
- **zod** - Runtime validation for astronomical data structures

### System Dependencies
- **Reliable Internet Connection** - For real-time astronomical data
- **Caching System** - For performance optimization of calculations
- **Error Monitoring** - For tracking astronomical calculation failures
- **Performance Monitoring** - For optimizing calculation speed

### Knowledge Dependencies
- **Astrological Expertise** - For validating calculation accuracy and cultural sensitivity
- **Astronomical Knowledge** - For understanding calculation requirements and edge cases
- **Cultural Consultation** - For ensuring respectful integration of diverse traditions
- **User Experience Research** - For designing intuitive astrological interfaces

## Template Variables and Customization

### Available Astrological Variables
- `{{FEATURE_NAME}}` - Name of the astrological feature
- `{{ASTROLOGICAL_DOMAIN}}` - Primary astrological focus area
- `{{PLANETARY_FOCUS}}` - Specific planets or celestial bodies involved
- `{{ELEMENTAL_EMPHASIS}}` - Primary elemental considerations
- `{{SEASONAL_RELEVANCE}}` - Seasonal or timing considerations
- `{{CULTURAL_SCOPE}}` - Cultural integration requirements
- `{{ACCURACY_REQUIREMENTS}}` - Specific accuracy and precision needs

### Customization Options for Astrological Features
- Add or remove planetary considerations based on feature scope
- Adjust elemental requirements based on four-element system integration
- Modify seasonal adaptation based on astronomical timing needs
- Customize cultural integration based on target user demographics
- Scale performance requirements based on calculation complexity

### Usage Instructions for Astrological Templates
1. Copy this template for new astrological feature specifications
2. Replace all placeholder text with feature-specific astrological content
3. Customize astronomical considerations based on planetary focus
4. Adjust elemental factors based on four-element system integration
5. Ensure all requirements follow EARS format with astrological context
6. Validate astronomical accuracy requirements against project standards
7. Include cultural sensitivity considerations throughout
8. Test template completeness against astrological calculation needs

## References and Astrological Documentation

### Core Astrological References
- #[[file:src/calculations/culinary/]] - Core astrological calculation implementations
- #[[file:src/data/planets/]] - Planetary position data and transit information
- #[[file:src/utils/reliableAstronomy.ts]] - Reliable astronomical calculation utilities
- #[[file:src/constants/elementalProperties.ts]] - Four-element system definitions

### Astrological Integration Points
- #[[file:.kiro/steering/astrology-rules.md]] - Astrological calculation guidelines
- #[[file:.kiro/steering/elemental-principles.md]] - Four-element system enforcement
- #[[file:src/services/AlchemicalRecommendationService.ts]] - Astrological recommendation service
- #[[file:src/contexts/AstrologicalContext.tsx]] - Astrological state management

### Cultural and Philosophical References
- #[[file:.kiro/steering/product.md]] - Product vision and 14 Alchemical Pillars
- #[[file:docs/MISSION_STATEMENT.md]] - Project mission and cultural sensitivity
- #[[file:src/data/ingredients/]] - Culturally-sensitive ingredient databases
- #[[file:src/data/cuisines/]] - Cultural cuisine integration with astrological principles

---

**Template Version**: 1.0  
**Last Updated**: [Date]  
**Template Author**: Kiro Optimization Team  
**Astrological Review Status**: [Draft | Cultural Review | Astronomical Validation | Approved]  
**Cultural Sensitivity Review**: [Pending | In Progress | Completed]