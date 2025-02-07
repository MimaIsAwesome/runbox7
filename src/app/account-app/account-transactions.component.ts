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

import { Component } from '@angular/core';
import { RunboxWebmailAPI } from '../rmmapi/rbwebmail';
import { AsyncSubject } from 'rxjs';

import * as moment from 'moment';

@Component({
    selector: 'app-account-transactions-component',
    templateUrl: './account-transactions.component.html',
})
export class AccountTransactionsComponent {
    transactions = new AsyncSubject<any[]>();

    methods = {
        bitpay:     'Bitpay',
        creditcard: 'Netaxept',
        giro:       'Offline',
        paypal:     'PayPal',
        stripe:     'Stripe',
    };

    statuses = {
        0: 'Successful',
        1: 'Pending',
        2: 'Refunded',
    };

    constructor(
        private rmmapi: RunboxWebmailAPI,
    ) {
        this.rmmapi.getTransactions().subscribe(transactions => {
            const txns = transactions.map(t => {
                t.time = moment(t.time, moment.ISO_8601);
                return t;
            });

            txns.reverse();
            this.transactions.next(txns);
            this.transactions.complete();
        });
    }
}
