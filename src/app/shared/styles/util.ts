import { DomSanitizer } from "@angular/platform-browser";

export const parentCommentStatusBasedStyles = {
    bgColor: '#d4ebff',
    color: '#3380c4',
    bdColor: '#87ceeb',
};

export function getFormattedHighlightText(
    content: string,
    ranges: any[],
    parentCommentStatusBasedStyles: {
        bgColor: string;
        color: string;
        bdColor: string;
    },
    sanitizer:DomSanitizer
) {
    let highlightedContent = content;
    let replaceContentIndex = 0;
    ranges.forEach((range) => {
        const start = range.indices.start;
        const end = range.indices.end;
        const highlightedText = content.substring(start, end);
        const highlighted = `<span style="background-color: ${parentCommentStatusBasedStyles.bgColor};color: ${parentCommentStatusBasedStyles.color};white-space: nowrap;border: 1px solid ${parentCommentStatusBasedStyles.bdColor};padding: 0 3px;border-radius: 3px;">${highlightedText}</span>`;
        const newReplace = highlightedContent
            .substring(replaceContentIndex)
            .replace(highlightedText, highlighted);
        highlightedContent =
            replaceContentIndex === 0
                ? newReplace
                : highlightedContent.substring(0, replaceContentIndex) + newReplace;
        replaceContentIndex = highlightedContent.lastIndexOf('</span>') + 7;
    });

    highlightedContent = highlightedContent.replace(/\n/g, '<br>');
    return sanitizer.bypassSecurityTrustHtml(
        highlightedContent
    ) as string;
}