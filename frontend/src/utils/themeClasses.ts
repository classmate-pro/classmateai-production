import { CoreSettings } from '../types';

export function getTextColorClass(color: CoreSettings['color']) {
  switch (color) {
    case 'pink': return 'text-cyber-pink';
    case 'green': return 'text-cyber-green';
    case 'amber': return 'text-cyber-amber';
    case 'cyan':
    default:
      return 'text-cyber-cyan';
  }
}

export function getBgColorClass(color: CoreSettings['color']) {
  switch (color) {
    case 'pink': return 'bg-cyber-pink';
    case 'green': return 'bg-cyber-green';
    case 'amber': return 'bg-cyber-amber';
    case 'cyan':
    default:
      return 'bg-cyber-cyan';
  }
}
