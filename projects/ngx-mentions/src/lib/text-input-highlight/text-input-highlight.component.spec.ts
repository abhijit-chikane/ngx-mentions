import { indexIsInsideTag, isCoordinateWithinRect, overlaps } from "./text-input-highlight.component";

describe('indexIsInsideTag_function', () => {

    // Tests that indexIsInsideTag returns true when index is inside tag indices
    it('test_index_inside_tag', () => {
        const tag = { indices: { start: 2, end: 5, triggerCharacter: '@' } };
        const index = 3;
        expect(indexIsInsideTag(index, tag)).toBe(true);
    });

    // Tests that indexIsInsideTag returns false when index is equal to tag indices start
    it('test_index_equal_to_tag_start', () => {
        const tag = { indices: { start: 2, end: 5, triggerCharacter: '@' } };
        const index = 2;
        expect(indexIsInsideTag(index, tag)).toBe(false);
    });

    // Tests that indexIsInsideTag returns false when index is equal to tag indices end
    it('test_index_equal_to_tag_end', () => {
        const tag = { indices: { start: 2, end: 5, triggerCharacter: '@' } };
        const index = 5;
        expect(indexIsInsideTag(index, tag)).toBe(false);
    });

    // Tests that indexIsInsideTag returns false when index is outside tag indices
    it('test_index_outside_tag', () => {
        const tag = { indices: { start: 2, end: 5, triggerCharacter: '@' } };
        const index = 1;
        expect(indexIsInsideTag(index, tag)).toBe(false);
    });

    // Tests that indexIsInsideTag returns false when tag indices start and end are the same
    it('test_tag_start_and_end_are_same', () => {
        const tag = { indices: { start: 2, end: 2, triggerCharacter: '@' } };
        const index = 2;
        expect(indexIsInsideTag(index, tag)).toBe(false);
    });

    // Tests that indexIsInsideTag returns false when tag indices start is greater than tag indices end
    it('test_tag_start_greater_than_end', () => {
        const tag = { indices: { start: 5, end: 2, triggerCharacter: '@' } };
        const index = 3;
        expect(indexIsInsideTag(index, tag)).toBe(false);
    });
});

describe('overlaps_function', () => {

    // Tests that two tags with no overlap return false
    it('test_no_overlap', () => {
        const tagA = { indices: { start: 0, end: 5, triggerCharacter: '' } };
        const tagB = { indices: { start: 6, end: 10, triggerCharacter: '' } };
        expect(overlaps(tagA, tagB)).toBe(false);
    });

    // Tests that two tags with overlap at the start return true
    it('test_overlap_at_start', () => {
        const tagA = { indices: { start: 0, end: 5, triggerCharacter: '' } };
        const tagB = { indices: { start: 3, end: 10, triggerCharacter: '' } };
        expect(overlaps(tagA, tagB)).toBe(true);
    });

    // Tests that two tags with overlap at the end return true
    it('test_overlap_at_end', () => {
        const tagA = { indices: { start: 0, end: 5, triggerCharacter: '' } };
        const tagB = { indices: { start: 2, end: 4, triggerCharacter: '' } };
        expect(overlaps(tagA, tagB)).toBe(true);
    });

    // Tests that two tags with overlap in the middle return true
    it('test_overlap_in_middle', () => {
        const tagA = { indices: { start: 0, end: 5, triggerCharacter: '' } };
        const tagB = { indices: { start: 2, end: 7, triggerCharacter: '' } };
        expect(overlaps(tagA, tagB)).toBe(true);
    });

    // Tests that one tag completely inside another tag returns true
    it('test_one_tag_inside_another', () => {
        const tagA = { indices: { start: 0, end: 10, triggerCharacter: '' } };
        const tagB = { indices: { start: 2, end: 7, triggerCharacter: '' } };
        expect(overlaps(tagA, tagB)).toBe(true);
    });

    // Tests that one tag completely outside another tag returns false
    it('test_one_tag_outside_another', () => {
        const tagA = { indices: { start: 0, end: 5, triggerCharacter: '' } };
        const tagB = { indices: { start: 6, end: 10, triggerCharacter: '' } };
        expect(overlaps(tagA, tagB)).toBe(false);
    });
});