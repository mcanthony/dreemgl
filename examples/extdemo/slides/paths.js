/* Copyright 2015 Teem2 LLC - Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 either express or implied. See the License for the specific language governing permissions and limitations under the License.*/

define.class(function (require, $ui$, view, label) {

    this.slidetitle = "Integration Paths - Proxy vs POST";

    this.flexdirection = 'column';
    this.bgcolor = 'transparent';

    this.render = function render() {
        return [
            label({
                text:'Proxy through service when nodejs libraries are available (all in DreemGL!)',
                alignself:'center',
                fgcolor:'#333',
                bgcolor:'transparent',
                fontsize:20
            }),
            view({
                flex:1,
                alignself:'center',
                bgimage:require('./server.png')
            }),
            label({
                text:'Use the POST API to drive DreemGL externally from IoT devices and web services',
                alignself:'center',
                fgcolor:'#333',
                bgcolor:'transparent',
                fontsize:20,
                margintop:10
            }),
            view({
                flex:1,
                bgimage:require('./postapi.png'),
                alignself:'center'
            })
        ];
    };
});