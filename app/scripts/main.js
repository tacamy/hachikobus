/*!
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
(function () {
  'use strict';

  var querySelector = document.querySelector.bind(document);

  var navdrawerContainer = querySelector('.navdrawer-container');
  var body = document.body;
  var appbarElement = querySelector('.app-bar');
  var menuBtn = querySelector('.menu');
  var main = querySelector('main');

  function closeMenu() {
    body.classList.remove('open');
    appbarElement.classList.remove('open');
    navdrawerContainer.classList.remove('open');
  }

  function toggleMenu() {
    body.classList.toggle('open');
    appbarElement.classList.toggle('open');
    navdrawerContainer.classList.toggle('open');
    navdrawerContainer.classList.add('opened');
  }

  main.addEventListener('click', closeMenu);
  menuBtn.addEventListener('click', toggleMenu);
  navdrawerContainer.addEventListener('click', function (event) {
    if (event.target.nodeName === 'A' || event.target.nodeName === 'LI') {
      closeMenu();
    }
  });
})();



(function ($, window, document, undefined) {
  'use strict';

  var map = {};

  var tile = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  });

  var busstop = L.layerGroup();

  var promise = createMarker();

  promise.done(function () {
    map = L.map('map', {
      layers: [tile, busstop]
    }).setView([35.674412, 139.710797], 15);
  });

  function createMarker() {
    var d = new $.Deferred;

    $.ajax({
      url: '/scripts/data.json',
      dataType: 'json'
    })
    .done(function (data) {
      data.items.forEach(function (item) {
        var marker = L.marker(item.coordinates).bindPopup(item.number + ' : ' + item.name);
        busstop.addLayer(marker);
      });
      d.resolve();
    });

    return d.promise();
  }

})(jQuery, this, this.document);
