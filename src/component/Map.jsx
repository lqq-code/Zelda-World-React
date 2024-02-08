import { useEffect, useState } from 'react';
import L from 'leaflet';
import './Map.css';
import { markerCatalog } from './catalog';
import { markerData } from './marker';
import 'leaflet/dist/leaflet.css';
import { renderToString } from 'react-dom/server';

function Map() {
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const bounds = new L.LatLngBounds(
      new L.LatLng(-49.875, 34.25),
      new L.LatLng(-206, 221)
    );

    const map = L.map('mapContainer', {
      crs: L.CRS.Simple,
      attributionControl: false,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
    }).setView([0, 0], 2);

    L.tileLayer('/assets/images/maps/{z}_{x}_{y}.png', {
      attribution: '&copy; David',
      minZoom: 2,
      maxZoom: 7,
      noWrap: true,
      bounds: bounds
    }).addTo(map);

    const markerStyle = {};
    const visibleMarker = {};
    let css = '';
    const typeChinese = {
      quest: 'quest',
      miniboss: 'miniboss',
      treasure: 'treasure',
      shrine: 'shrine',
      stable: 'stable',
      tower: 'tower',
      town: 'town',
      'great-fairy-fountain': 'fountain',
      'korok-seed': 'seed',
      memory: 'memory',
    };

    const listContainer = document.createElement('ul');
    document.getElementById('switchType').appendChild(listContainer);

    const createListItem = (data) => {
      const li = document.createElement('li');
      li.dataset.type = data.id || 'none';
      li.textContent = typeChinese[data.name] || data.name;
      li.classList.add('title');
      if (data.children) {
        data.children.forEach((child) => {
          const subLi = document.createElement('li');
          subLi.dataset.type = child.id;
          subLi.textContent = typeChinese[child.name] || child.name;
          subLi.classList.add(`icon-${child.img}`);
          listContainer.appendChild(subLi);
          markerStyle[child.id] = child.img;
          visibleMarker[child.id] = false;
          css += `.icon-${child.img}, .icon-${child.img}:after {background-color: ${child.color};}`;
        });
      }
      listContainer.appendChild(li);
    };

    markerCatalog.forEach((data) => createListItem(data));

    const styleElement = document.createElement('style');
    console.log('styleElement', styleElement);
    styleElement.textContent = css;
    document.head.appendChild(styleElement);

    listContainer.addEventListener('click', (event) => {
      const target = event.target;
      if (target.tagName === 'LI') {
        const dataType = target.dataset.type;
        if (dataType) toggleVisible(dataType);
      }
    });

    function toggleVisible(type) {
      console.log('visibleMarker', type);

      if (type === 'all' || type === 'none') {
        for (const key in visibleMarker) {
          if (visibleMarker?.hasOwnProperty(key)) {
            visibleMarker[key] = type === 'all';
          }
        }
      } else {
        if (event.ctrlKey) {
          visibleMarker[type] = !visibleMarker[type];
        } else {
          for (const key in visibleMarker) {
            if (visibleMarker?.hasOwnProperty(key)) {
              visibleMarker[key] = false;
            }
          }
          visibleMarker[type] = true;
        }
      }
      refreshFilter();
      refreshMarker('filter');
    }

    function refreshFilter() {
      let allVisible = true;
      let allHidden = true;
      for (const key in visibleMarker) {
        if (visibleMarker?.hasOwnProperty(key)) {
          if (!visibleMarker[key]) {
            allVisible = false;
          } else {
            allHidden = false;
          }
        }
      }
      const switchTypeLis = listContainer.querySelectorAll('li');
      switchTypeLis.forEach((li) => li.classList.remove('current'));
      if (allVisible) {
        switchTypeLis.forEach((li) => {
          if (li.dataset.type === 'all') {
            li.classList.add('current');
          }
        });
      } else if (allHidden) {
        switchTypeLis.forEach((li) => {
          if (li.dataset.type === 'none') {
            li.classList.add('current');
          }
        });
      } else {
        switchTypeLis.forEach((li) => {
          if (visibleMarker[li.dataset.type]) {
            li.classList.add('current');
          }
        });
      }
    }

    const cacheMarker = [];
    function refreshMarker(from) {
      cacheMarker.forEach((marker) => marker.remove());
      cacheMarker.length = 0;
      markerData.forEach((data) => {
        let visible = false;
        if (from === 'filter' && visibleMarker[data.markerCategoryId]) visible = true;
        if (from === 'search') {
          if (
            data.name.toLowerCase().trim().includes(keyword.toLowerCase().trim()) ||
            data.description.toLowerCase().trim().includes(keyword.toLowerCase().trim())
          ) {
            visible = true;
          }
        }
        if (visible) {
          const key = `${data.markerCategoryId}-${data.id}-${data.name.replace(/[^A-Z]/gi, '-')}`;
          console.log('data', data);
          let popupHtml = renderToString(
            <div className="popupContainer">
              <strong className="name">{data.name}</strong>
              <div className="buttonContainer">
                <span className="markButton" onClick={() => markPoint(key)} data-key={key}>Mark</span>
                <a className="markButton" target="_blank" href={`http://www.ign.com/search?q=${encodeURIComponent(data.name)}`} rel="noreferrer">IGN</a>
                <a className="markButton" target="_blank" href={`http://www.polygon.com/search?q=${encodeURIComponent(data.name)}`} rel="noreferrer">Polygon</a>
                <a className="markButton" target="_blank" href={`https://c.gufen.ga/#q=${encodeURIComponent(data.name)}`} rel="noreferrer">Google</a>
              </div>
            </div>
          );
          popupHtml += `</div>`;
          let className = `mark-${key}`;
          if (localStorage.getItem(key)) {
            className += ' marked';
          }
          className += ` markIcon icon-${markerStyle[data.markerCategoryId]}`;
          const marker = L.marker([data.y, data.x], {
            title: data.name,
            icon: L.divIcon({
              className: className,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
              popupAnchor: [0, -10],
            }),
          }).addTo(map).bindPopup(popupHtml);
          cacheMarker.push(marker);
        }
      });
    }

    toggleVisible('1925');
    let lastKeyword = '';
    setInterval(() => {
      const newKeyword = document.getElementById('keywords').value;
      console.log('newKeyword', newKeyword);
      if (newKeyword !== lastKeyword) {
        if (newKeyword) {
          lastKeyword = newKeyword;
          refreshMarker('search');
        } else {
          refreshMarker('filter');
        }
      }
    }, 500);

    document.getElementById('clearKeyword').addEventListener('click', () => {
      setKeyword('');
    });

    
    function markPoint(element) {
      const key = element.dataset.key;
      const oldValue = localStorage.getItem(key);
      const newValue = !oldValue;
      localStorage.setItem(key, newValue ? '1' : '');
      const elements = document.querySelectorAll(`#mapContainer .leaflet-marker-pane .mark-${key}`);
      elements.forEach((el) => el.classList.toggle('marked', newValue));
    }

    return () => {
      map.remove();
    };
  }, []);

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value);
  };

  return (
    <div className="mapItem">
      <div id="switchType">
        <span>slect</span>
        <ul>
          <li data-type="all">All</li>
          <li data-type="none">None</li>
        </ul>
      </div>
      <div id="nameSearch">
        <input id="keywords" type="text" value={keyword} onChange={handleKeywordChange} placeholder="search" />
        <span id="clearKeyword" className="clear" onClick={() => setKeyword('')}>clear</span>
      </div>
      <div id="mapContainer" className="map-container"></div>
    </div>
  );
}

export default Map;
