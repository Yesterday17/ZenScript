import { CommentEntry } from '.';

const LINE_COMMENT = /(?:\/\/|#)(.*)/g;
const BLOCK_COMMENT = /\/\*((?:[^*]|\*+[^*/])*)(?:\*+\/)?/g;

class CommentScanner {
  scan(input: string): CommentEntry[] {
    const result: CommentEntry[] = [];

    [LINE_COMMENT, BLOCK_COMMENT].forEach(regex => {
      let find;
      while ((find = regex.exec(input)) !== null) {
        result.push({
          content: find[1],
          start: find.index,
          end: regex.lastIndex,
        });
      }
    });

    return result;
  }
}

export const ZSCommentScanner = new CommentScanner();
