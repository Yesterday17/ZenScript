import get from 'get-value';
import { zGlobal } from '../api/global';

export function ImportCompletion(prev: string[]) {
  let result;
  if (prev.length === 0) {
    result = zGlobal.packages;
  } else {
    result = get(zGlobal.packages, prev);
  }
  if (result) {
    return Object.keys(result).map(k => {
      return { label: k };
    });
  }
}
