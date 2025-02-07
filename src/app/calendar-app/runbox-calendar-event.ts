// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2019 Runbox Solutions AS (runbox.com).
//
// This file is part of Runbox 7.
//
// Runbox 7 is free software: You can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
//
// Runbox 7 is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Runbox 7. If not, see <https://www.gnu.org/licenses/>.
// ---------- END RUNBOX LICENSE ----------

import { CalendarEvent } from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import { RRule, rrulestr } from 'rrule';

import * as moment from 'moment';
import * as ICAL from 'ical.js';

export class RunboxCalendarEvent implements CalendarEvent {
    id?:       string;

    // all recurrences of an event will have a parent set to the original one
    parent?: RunboxCalendarEvent;

    color     = {} as EventColor;
    draggable = true;

    // we need those separately from start/end
    // start and end are for display pursposes only,
    // and will be different from dtstart/dtend in
    // recurring events
    calendar:  string;

    event: ICAL.Event = {};

    get title(): string {
        return this.event.summary;
    }

    set title(value: string) {
        this.event.summary = value;
    }

    get location(): string {
        return this.event.location;
    }

    set location(value: string) {
        this.event.location = value;
    }

    get description(): string {
        return this.event.description;
    }

    set description(value: string) {
        this.event.description = value;
    }

    get dtstart(): moment.Moment {
        return moment(this.event.startDate.toJSDate(), moment.ISO_8601);
    }

    set dtstart(value: moment.Moment) {
        const allDay = this.allDay;
        this.event.startDate = ICAL.Time.fromJSDate(value.toDate());
        this.allDay = allDay;
    }

    get dtend(): moment.Moment {
        return this.event.endDate
            ? moment(this.event.endDate.toJSDate(), moment.ISO_8601)
            : undefined;
    }

    set dtend(value: moment.Moment) {
        const allDay = this.allDay;
        this.event.endDate = value ? ICAL.Time.fromJSDate(value.toDate()) : undefined;
        this.allDay = allDay;
    }

    // angular-calendar compatibility

    get start(): Date {
        return this.dtstart.toDate();
    }

    get end(): Date {
        if (!this.dtend) {
            return undefined;
        }

        const shownEnd = moment(this.dtend);
        if (this.allDay) {
            shownEnd.subtract(1, 'days');
        } else {
            shownEnd.subtract(1, 'seconds');
        }
        return shownEnd.toDate();
    }

    get allDay(): boolean {
        // isDate in ICAL.Event means "has no time"
        return this.event.startDate.isDate;
    }

    // deprecated, we should move away from this eventually
    get rrule(): RRule {
        let rrule = this.event.component.getFirstPropertyValue('rrule');
        if (rrule) {
            rrule = rrule.toString(); // ICAL claims this should be a string, but sometimes it's not
            return rrulestr(rrule, { dtstart: this.dtstart.toDate() });
        }
        return undefined;
    }

    get recurringFrequency(): string {
        const recur = this.event.component.getFirstPropertyValue('rrule');
        return recur ? recur.freq : '';
    }

    set recurringFrequency(frequency: string) {
        this.event.component.removeProperty('rrule');
        if (frequency !== '') {
            this.event.component.addPropertyWithValue('rrule', new ICAL.Recur({ freq: frequency }));
        }
    }

    set allDay(value) {
        this.event.startDate.isDate = value;
        if (this.event.endDate) {
            this.event.endDate.isDate = value;
        }
        // I know this looks silly, but without this
        // ICAL.Event will not notice the isDate change
        // and the event metadata will still be off
        this.event.startDate = this.event.startDate;
        this.event.endDate   = this.event.endDate;
    }

    static fromIcal(id: string, ical: string): RunboxCalendarEvent {
        return new this(id, ICAL.parse(ical));
    }

    // creates an unnamed event for today
    static newEmpty(): RunboxCalendarEvent {
        return new this(
            undefined,
            [ 'vcalendar', [], [
                [ 'vevent',
                    [
                        [ 'dtend',   {}, 'date-time', '2019-10-02T14:00:00' ],
                        [ 'dtstart', {}, 'date-time', '2019-10-02T12:00:00' ],
                        [ 'summary', {}, 'text', '' ] ],
                    []
                ]
            ] ]
        );
    }

    constructor(id: string, jcal: any) {
        this.id = id;
        if (this.id) {
            this.calendar = this.id.split('/')[0];
        }

        const comp = new ICAL.Component(jcal);
        if (comp.name === 'vevent') {
            this.event = new ICAL.Event(comp);
        } else {
            this.event = new ICAL.Event(comp.getFirstSubcomponent('vevent'));
        }
    }

    clone(): RunboxCalendarEvent {
        const ical = this.event.toString();
        return RunboxCalendarEvent.fromIcal(this.id, ical);
    }

    recurrenceAt(dt: moment.Moment): RunboxCalendarEvent {
        const copy = this.clone();
        copy.parent = this;

        let duration: moment.Duration;
        if (this.dtend) {
            duration = moment.duration(this.dtend.diff(this.dtstart));
        }

        copy.dtstart = dt;
        if (duration) {
            copy.dtend = copy.dtstart.add(duration);
        }

        return copy;
    }

    toIcal(): string {
        return 'BEGIN:VCALENDAR\n' + this.event.toString() + '\nEND:VCALENDAR';
    }

    // returns jCal
    toJSON(): any {
        return {
            id:       this.id,
            calendar: this.calendar,
            jcal:     this.event.component.toJSON(),
        };
    }
}
