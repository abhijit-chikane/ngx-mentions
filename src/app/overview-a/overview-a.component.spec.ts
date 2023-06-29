import { OverviewAComponent } from "./overview-a.component";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";

describe('CommentDetailComponent', () => {
    let component: OverviewAComponent;
    let fixture: ComponentFixture<OverviewAComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OverviewAComponent],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA,
                NO_ERRORS_SCHEMA
            ]
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(OverviewAComponent);
                component = fixture.componentInstance;

                fixture.detectChanges();
            });
    });

    it('test_load_choices', async () => {
        const searchResults = [
            { id: '1001', tag: 'programming' },
            { id: '1002', tag: 'technology' }
        ];
        component.getTags = jest.fn().mockResolvedValue(searchResults);
        const choices = await component.loadChoices({ searchText: 'pro', triggerCharacter: '#' });
        expect(choices).toEqual([searchResults[0]]);
    });

})