// src / (utils || 1) / (popup.ts || 1)

import ../constants  from 'elementalConstants ';
import ../types  from 'alchemy ';

const ELEMENT_COLORS = {
  Fire: {
    primary: '#FF3B3B',
    secondary: '#FFE2E2',
    gradient: 'linear-gradient(135deg, #FF3B3B 0%, #FF8071 100%)'
  },
  Water: {
    primary: '#4B89FF',
    secondary: '#E3F2FD',
    gradient: 'linear-gradient(135deg, #4B89FF 0%, #64B5F6 100%)'
  },
  Air: {
    primary: '#FFB300',
    secondary: '#FFF8E1',
    gradient: 'linear-gradient(135deg, #FFB300 0%, #FDD835 100%)'
  },
  Earth: {
    primary: '#43A047',
    secondary: '#E8F5E9',
    gradient: 'linear-gradient(135deg, #43A047 0%, #81C784 100%)'
  }
};

function getElementalTheme(sunSign: ZodiacSign, moonSign: ZodiacSign) {
  const sunElement = ZODIAC_ELEMENTS[sunSign];
  const moonElement = ZODIAC_ELEMENTS[moonSign];
  
  // Check if elements are complementary
  const isHarmonious = ELEMENT_AFFINITIES[sunElement].includes(moonElement);
  
  return {
    primary: ELEMENT_COLORS[sunElement].primary,
    secondary: ELEMENT_COLORS[moonElement].secondary,
    gradient: isHarmonious 
      ? `linear-gradient(135deg, ${ELEMENT_COLORS[sunElement].primary} 0%, ${ELEMENT_COLORS[moonElement].primary} 100%)`
      : ELEMENT_COLORS[sunElement].gradient
  };
}

export function createPopup(message: string, options: {
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info' | 'default';
  position?: 'center' | 'top' | 'bottom';
  sunSign?: ZodiacSign;
  moonSign?: ZodiacSign;
  showIcon?: boolean;
} = {}) {
    const {
        duration = 3000,
        type = 'default',
        position = 'center',
        sunSign = 'aries',
        moonSign = 'aries',
        showIcon = true
    } = options;

    const elementalTheme = getElementalTheme(sunSign, moonSign);

    // Create popup elements
    const popup = document.createElement('div');
    popup.className = `popup popup-${type} popup-${position}`;
    
    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'popup-content';

    // Add icon if enabled
    if (showIcon) {
        const icon = document.createElement('span');
        icon.className = 'popup-icon';
        icon.innerHTML = getElementIcon(ZODIAC_ELEMENTS[sunSign]);
        contentWrapper.appendChild(icon);
    }

    // Add message
    const messageElement = document.createElement('p');
    messageElement.innerText = message;
    contentWrapper.appendChild(messageElement);

    popup.appendChild(contentWrapper);

    // Apply dynamic styles
    const styles = document.createElement('style');
    styles.textContent = `
        .popup {
            position: fixed;
            padding: 1rem 1.5rem;
            background: ${elementalTheme.gradient};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
            transform: scale(0.95);
            min-width: 300px;
            max-width: 80vw;
        }

        .popup.show {
            opacity: 1;
            transform: scale(1);
        }

        .popup-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .popup-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .popup-center {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.95);
        }

        .popup-center.show {
            transform: translate(-50%, -50%) scale(1);
        }

        .popup-top {
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
        }

        .popup-top.show {
            transform: translateX(-50%) translateY(0);
        }

        .popup-bottom {
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
        }

        .popup-bottom.show {
            transform: translateX(-50%) translateY(0);
        }

        .popup-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .popup-error { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
        .popup-warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .popup-info { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
    `;

    document.head.appendChild(styles);

    // Add to document
    document.body.appendChild(popup);

    // Trigger animation
    requestAnimationFrame(() => {
        popup.classList.add('show');
    });

    // Remove popup after duration
    const timeout = setTimeout(() => {
        popup.classList.remove('show');
        popup.addEventListener('transitionend', () => {
            popup.remove();
            styles.remove();
        });
    }, duration);

    // Allow early dismissal
    popup.addEventListener('click', () => {
        clearTimeout(timeout);
        popup.classList.remove('show');
        popup.addEventListener('transitionend', () => {
            popup.remove();
            styles.remove();
        });
    });

    return popup;
}

function getElementIcon(element: Element): string {
    switch (element) {
        case 'Fire':
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12l2.12 2.12L12 12.24l-2.12-2.12zM12 6l2.83 2.83L12 11.66l-2.83-2.83z"/>
            </svg>`;
        case 'Water':
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 22h20L12 2zm0 4l6.67 13.33H5.33L12 6z"/>
            </svg>`;
        case 'Air':
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 17.5L12 15l-2.5 2.5M12 3v12"/>
            </svg>`;
        case 'Earth':
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2v20M2 12h20"/>
            </svg>`;
        default:
            return '';
    }
}

// Example usage:
/*
createPopup('Recipe harmony achieved!', {
    type: 'success',
    position: 'top',
    sunSign: 'leo',
    moonSign: 'cancer',
    duration: 4000
});
*/