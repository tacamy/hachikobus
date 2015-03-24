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

  var BusLocation = (function () {
    function BusLocation() {
      this.init();
      this.getData();
    }

    var fn = BusLocation.prototype;

    fn.init = function () {
      this.icon = {
        locateIcon: L.icon({
          iconUrl: '/images/marker-location.png',
          iconRetinaUrl: '/images/marker-location@2x.png',
          iconSize: [35, 47]
        }),
        busIcon: L.icon({
          iconUrl: '/images/marker-bus.png',
          iconRetinaUrl: '/images/marker-bus@2x.png',
          iconSize: [40, 44]
        })
      };
      this.data = {};
      this.map = {};
      this.tile = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      });
      this.busstopGroup = L.layerGroup();
    };

    fn.getData = function () {
      var self = this;
      var date = moment().format('YYYY-MM-DD');

      $.when(
        $.getJSON('/scripts/api/dummy/busstop_shibuya.json'),
        $.getJSON('/scripts/api/dummy/timetable.json')
      )
      .done(function (data1, data2) {
        self.data.busstop = data1[0];
        self.data.timetable = data2[0];

        self.data.timetable.buses.map(function (bus) {
          bus.map(function (item) {
            var m = moment(date + ' ' + item.time);
            item.m = m;
          });
        });

        self.renderBusstop();
        self.renderBus();
      })
      .fail(function () {
        console.log('Error');
      });
    };

    // バス停を地図上に表示
    fn.renderBusstop = function () {
      var self = this;

      self.data.busstop.items.forEach(function (item) {
        var marker = L.marker(item.coordinates).bindPopup(item.id + ' : ' + item.name);
        self.busstopGroup.addLayer(marker);
      });

      self.map = L.map('map', {
        layers: [self.tile, self.busstopGroup]
      });

      // 現在地取得
      self.map.locate({setView: true, maxZoom: 16});
      self.map.on('locationfound', onLocationFound);
      self.map.on('locationerror', onLocationError);

      // 現在地取得成功
      function onLocationFound(e) {
        L.marker(e.latlng, {icon: self.icon.locateIcon}).addTo(self.map);
      }

      // 現在地取得失敗
      function onLocationError(e) {
        console.log(e.message);
      }
    };

    // 現在走っているバスを地図上に表示
    fn.renderBus = function () {
      var self = this;
      var now = moment();
      var matchedList = [];
      var nextList = [];

      // 時刻表から現在の時刻と一致するレコードを取得
      self.data.timetable.buses.forEach(function (bus, index) {
        _.some(bus, function (item, i) {
          var diff = item.m.diff(now, 'minutes');

          if (diff === 0) {
            matchedList.push(item);
            return true;
          }
          else if (diff > 0) {
            if (i === 0) {
              return true;
            }
            else {
              nextList.push(item);
              return true;
            }
          }
        });
      });

      console.log('matched:', matchedList, 'next:', nextList);

      if (!matchedList.length && !nextList.length) {
        console.log('現在走っているバスはありません');
      }
      else {
        matchedList.forEach(function (item) {
          var busstop = _.find(self.data.busstop.items, function (busstopItem) {
            return item.id === busstopItem.id;
          });

          L.marker(busstop.coordinates, {icon: self.icon.busIcon}).addTo(self.map);
        });

        nextList.forEach(function (item) {
          var nextBusstop = _.find(self.data.busstop.items, function (busstopItem) {
            return item.id === busstopItem.id;
          });
          var prevBusstop = _.find(self.data.busstop.items, function (busstopItem) {
            return item.id - 1 == busstopItem.id;
          });

          var coordinates = [];

          coordinates.push((nextBusstop.coordinates[0] + prevBusstop.coordinates[0]) / 2);
          coordinates.push((nextBusstop.coordinates[1] + prevBusstop.coordinates[1]) / 2);

          L.marker(coordinates, {icon: self.icon.busIcon}).addTo(self.map);
        });
      }
    };

    return BusLocation;
  })();

  window.busLocation = new BusLocation();

})(jQuery, this, this.document);
