
        class CampaignController {
          private complexMethod() {
            // Complex enterprise logic with high complexity
            let result = 0;
            for (let i = 0; i < 10; i++) {
              for (let j = 0; j < 10; j++) {
                if (i > 5) {
                  if (j > 5) {
                    result += i * j;
                  } else {
                    result += i + j;
                  }
                } else {
                  result += i - j;
                }
              }
            }
            return result;
          }
        }
      