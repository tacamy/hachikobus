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

  // データ
  var busstopData = {};
  var timetableData = {};

  // 地図
  var map = {};

  // タイル
  var base = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  });

  // バス停
  var busstop = L.layerGroup();

  // アイコン
  var locateIcon = L.icon({
    iconUrl: '/images/marker-location.png',
    iconRetinaUrl: '/images/marker-location@2x.png',
    iconSize: [35, 47]
  });

  var busIcon = L.icon({
    iconUrl: '/images/marker-bus.png',
    iconRetinaUrl: '/images/marker-bus@2x.png',
    iconSize: [40, 44]
  });

  $.ajax({
    url: '/scripts/_shibuya.json',
    dataType: 'json'
  })
  .done(function (data) {
    busstopData = data;

    data.items.forEach(function (item) {
      var marker = L.marker(item.coordinates).bindPopup(item.id + ' : ' + item.name);
      busstop.addLayer(marker);
    });

    map = L.map('map', {
      layers: [base, busstop]
    });

    // 現在地取得
    map.locate({setView: true, maxZoom: 16});
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    // 現在地取得成功
    function onLocationFound(e) {
      L.marker(e.latlng, {icon: locateIcon}).addTo(map);
    }

    // 現在地取得失敗
    function onLocationError(e) {
      console.log(e.message);
    }
  });


  $.ajax({
    url: '/scripts/timetable.json',
    dataType: 'json'
  })
  .done(function (data) {
    timetableData = data;

    // 現在の時刻を取得
    var now = moment().format('HH:mm');
    var prev = null;

    // 時刻表から現在の時刻と一致するレコードを取得
    var matched = _.find(timetableData.timetable, function (item, i) {
      if (i === 0) {
        return item.time === now;
      }
      else {
        prev = timetableData.timetable[i - 1];
        return item.time >= now;
      }
    });

    if (!matched) {
      console.log('現在走っているバスはありません');
    }
    else {
      console.log(matched.id);
      console.log(prev.id);

      // 現在の時刻に到着するバス停を取得
      var nextBus = _.find(busstopData.items, function (item) {
        return item.id === matched.id;
      });

      var prevBus = _.find(busstopData.items, function (item) {
        return item.id === prev.id;
      });

      var coordinates = [];

      console.log(nextBus.coordinates);
      console.log(prevBus.coordinates);

      coordinates.push((nextBus.coordinates[0] + prevBus.coordinates[0]) / 2);
      coordinates.push((nextBus.coordinates[1] + prevBus.coordinates[1]) / 2);

      console.log(coordinates);

      // 走行中のバスマーカーを地図に追加
      L.marker(coordinates, {icon: busIcon}).addTo(map);
    }
  });


})(jQuery, this, this.document);
