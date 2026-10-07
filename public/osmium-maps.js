/**
 * Draws a map in every element carrying data-osmium-map, a JSON object:
 *   { pins: [{ lat, lng, title?, text?, url?, inactive? }], height?, fullscreen? }
 * Pin text is inserted as text, never HTML. Tiles: OpenStreetMap.
 */
(function () {
    'use strict';

    function popupFor(pin) {
        var box = document.createElement('div');

        if (pin.title) {
            var heading = document.createElement('strong');
            heading.textContent = pin.title;
            box.appendChild(heading);
        }
        if (pin.text) {
            var paragraph = document.createElement('div');
            paragraph.textContent = pin.text;
            box.appendChild(paragraph);
        }
        if (pin.url && /^https?:\/\//i.test(pin.url)) {
            var link = document.createElement('a');
            link.href = pin.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = 'More information';
            box.appendChild(link);
        }

        return box.childNodes.length ? box : null;
    }

    function addFullscreenButton(map, element) {
        var Control = L.Control.extend({
            options: { position: 'topleft' },
            onAdd: function () {
                var button = L.DomUtil.create('button', 'osmium-map-fullscreen');
                button.type = 'button';
                button.title = 'Toggle fullscreen';
                button.setAttribute('aria-label', 'Toggle fullscreen');
                button.textContent = '⛶';
                L.DomEvent.disableClickPropagation(button);
                L.DomEvent.on(button, 'click', function () {
                    element.classList.toggle('is-fullscreen');
                    map.invalidateSize(); // Leaflet caches its container size
                });
                return button;
            }
        });
        map.addControl(new Control());
    }

    function draw(element) {
        var options;
        try {
            options = JSON.parse(element.getAttribute('data-osmium-map'));
        } catch (e) {
            return;
        }

        var pins = (options.pins || []).filter(function (pin) {
            return typeof pin.lat === 'number' && typeof pin.lng === 'number';
        });

        element.classList.add('osmium-map');
        if (options.height) element.style.height = options.height;

        var map = L.map(element);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        var clusters = L.markerClusterGroup();
        var bounds = [];
        pins.forEach(function (pin) {
            var marker = L.marker([pin.lat, pin.lng], { title: pin.title || '' });
            if (pin.inactive) marker.on('add', function () { marker.getElement().classList.add('osmium-map-inactive'); });
            var popup = popupFor(pin);
            if (popup) marker.bindPopup(popup);
            clusters.addLayer(marker);
            bounds.push([pin.lat, pin.lng]);
        });
        map.addLayer(clusters);

        if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30] });
        else if (bounds.length === 1) map.setView(bounds[0], 13);
        else map.setView([54.5, -3], 5); // No pins: show the UK

        if (options.fullscreen !== false) addFullscreenButton(map, element);
    }

    function drawAll() {
        document.querySelectorAll('[data-osmium-map]').forEach(draw);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', drawAll);
    else drawAll();
})();
