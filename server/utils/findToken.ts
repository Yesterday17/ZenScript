import { IToken } from "chevrotain";

interface TokenFindResult {
  exist: boolean;
  found: TokenFound;
}

interface TokenFound {
  position: number;
  token: IToken;
}

const TOKEN_NOT_FOUND: TokenFindResult = {
  exist: false,
  found: {
    position: -1,
    token: null
  }
};

/**
 * Binary search for token at `offset`
 * @param arr an array of IToken
 * @param offset
 */
export function findToken(arr: IToken[], offset: number): TokenFindResult {
  let start: number = 0,
    end: number = arr.length - 1;

  while (start <= end) {
    const mid = Math.floor(start + (end - start) / 2);
    if (arr[mid].startOffset <= offset && arr[mid].endOffset >= offset) {
      return {
        exist: true,
        found: {
          position: mid,
          token: arr[mid]
        }
      };
    } else if (arr[mid].startOffset > offset) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return TOKEN_NOT_FOUND;
}
