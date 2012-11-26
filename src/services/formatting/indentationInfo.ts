// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='formatting.ts' />


module Formatting {
    export class IndentationInfo {

        constructor(
            public Prefix: string = null,
            public Level: number = 0) {
        }
    }
}
