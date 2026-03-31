/*!
* Start Bootstrap - Grayscale v7.0.3 (https://startbootstrap.com/theme/grayscale)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-grayscale/blob/master/LICENSE)
*/

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }
    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Back to top button
    let mybutton = document.getElementById("btn-back-to-top");

    window.onscroll = function () {
        scrollFunction();
    };

    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            mybutton.style.display = "block";
        } else {
            mybutton.style.display = "none";
        }
    }

    mybutton.addEventListener("click", backToTop);

    function backToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    // ============================================
    // ANIMATED NAME - Letter by letter animation
    // ============================================
    const nameText = "sharlena luyen";
    const animatedNameContainer = document.getElementById('animatedName');
    
    if (animatedNameContainer) {
        nameText.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.className = 'animated-letter';
            span.style.animationDelay = `${index * 0.1}s`;
            animatedNameContainer.appendChild(span);
        });
    }

    // ============================================
    // TRAVEL MAP - Modular country data
    // ============================================
    
    // Country data - easily extensible
    const travelData = {
        tahiti: {
            name: 'Tahiti',
            coords: '100,350,15', // x, y, radius for circular clickable area
            images: [
                'assets/img/tahiti1.jpg',
                'assets/img/tahiti2.jpg',
                'assets/img/tahiti3.jpg'
            ],
            story: 'Snorkeling with wild humpback whales in crystal clear waters was a dream come true. The baby whale jumped just feet from me while mama swam below. An unforgettable experience that reminded me why I love the ocean.'
        },
        peru: {
            name: 'Peru',
            coords: '250,320,15',
            images: [
                'assets/img/peru1.jpg',
                'assets/img/peru2.jpg',
                'assets/img/peru3.jpg'
            ],
            story: 'Four days of hiking through the Andes led to the breathtaking wonder of Machu Picchu. The ancient Incan citadel at sunrise, surrounded by mountains and clouds, was worth every step of the journey.'
        },
        australia: {
            name: 'Australia',
            coords: '820,370,15',
            images: [
                'assets/img/australia1.jpg',
                'assets/img/australia2.jpg',
                'assets/img/australia3.jpg'
            ],
            story: 'From feeding kangaroos to exploring the Great Barrier Reef, Australia offered endless adventures. The wildlife, landscapes, and friendly people made it an incredible journey down under.'
        }
        // Add more countries here following the same pattern
    };

    // Generate clickable map areas
    const mapElement = document.getElementById('travelMapClickable');
    if (mapElement) {
        Object.keys(travelData).forEach(country => {
            const area = document.createElement('area');
            area.shape = 'circle';
            area.coords = travelData[country].coords;
            area.href = '#';
            area.alt = travelData[country].name;
            area.dataset.country = country;
            
            area.addEventListener('click', (e) => {
                e.preventDefault();
                openTravelModal(country);
            });
            
            mapElement.appendChild(area);
        });
    }

    // Open travel modal with country data
    function openTravelModal(country) {
        const data = travelData[country];
        const modal = new bootstrap.Modal(document.getElementById('travelModal'));
        
        // Set title
        document.getElementById('travelModalLabel').textContent = data.name;
        
        // Set carousel images
        const carouselInner = document.getElementById('modalCarouselInner');
        carouselInner.innerHTML = '';
        data.images.forEach((img, index) => {
            const div = document.createElement('div');
            div.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            div.innerHTML = `<img src="${img}" class="d-block w-100" alt="${data.name} ${index + 1}">`;
            carouselInner.appendChild(div);
        });
        
        // Set story
        document.getElementById('modalStory').innerHTML = `<p>${data.story}</p>`;
        
        modal.show();
    }

    // ============================================
    // PLAYGROUND - Cat interactions
    // ============================================
    
    // Track active states
    let dodoActiveAccessory = null;
    let bumbumActiveAction = null;

    // Dodo wardrobe toggles
    document.querySelectorAll('[data-cat="dodo"]').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const accessory = e.target.dataset.accessory;
            const accessories = document.getElementById('dodoAccessories');
            
            // Clear all other toggles
            document.querySelectorAll('[data-cat="dodo"]').forEach(t => {
                if (t !== e.target) t.checked = false;
            });
            
            if (e.target.checked) {
                accessories.innerHTML = getDodoAccessory(accessory);
                dodoActiveAccessory = accessory;
            } else {
                accessories.innerHTML = '';
                dodoActiveAccessory = null;
            }
        });
    });

    // Bum Bum action toggles
    document.querySelectorAll('[data-cat="bumbum"]').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const action = e.target.dataset.action;
            const animation = document.getElementById('bumbumAnimation');
            
            // Clear all other toggles
            document.querySelectorAll('[data-cat="bumbum"]').forEach(t => {
                if (t !== e.target) t.checked = false;
            });
            
            if (e.target.checked) {
                animation.innerHTML = getBumbumAction(action);
                bumbumActiveAction = action;
            } else {
                animation.innerHTML = '';
                bumbumActiveAction = null;
            }
        });
    });

    // Dodo accessories (cartoon overlays)
    function getDodoAccessory(accessory) {
        const accessories = {
            'party-hat': `
                <div class="accessory party-hat">
                    <div class="hat-cone"></div>
                    <div class="hat-pom"></div>
                </div>
            `,
            'ao-dai': `
                <div class="accessory ao-dai">
                    <div class="ao-dai-top"></div>
                    <div class="ao-dai-pattern"></div>
                </div>
            `,
            'birthday-hat': `
                <div class="accessory birthday-hat">
                    <div class="birthday-cone"></div>
                    <div class="birthday-stars">✨</div>
                </div>
            `,
            'beanie': `
                <div class="accessory beanie">
                    <div class="beanie-top"></div>
                    <div class="beanie-pom"></div>
                </div>
            `,
            'tie': `
                <div class="accessory tie">
                    <div class="tie-knot"></div>
                    <div class="tie-length"></div>
                </div>
            `,
            'lion-mane': `
                <div class="accessory lion-mane">
                    <div class="mane-layer"></div>
                </div>
            `
        };
        return accessories[accessory] || '';
    }

    // Bum Bum actions (animated elements)
    function getBumbumAction(action) {
        const actions = {
            'cheer': `
                <div class="action-cheer">
                    <div class="confetti">🎉</div>
                    <div class="confetti">🎊</div>
                    <div class="confetti">✨</div>
                    <div class="cheer-text">Yay!</div>
                </div>
            `,
            'box': `
                <div class="action-box">
                    <div class="cardboard-box">
                        <div class="box-flap"></div>
                    </div>
                </div>
            `,
            'bug': `
                <div class="action-bug">
                    <div class="flying-bug">🐛</div>
                    <div class="paw-swipe">🐾</div>
                </div>
            `,
            'sleep': `
                <div class="action-sleep">
                    <div class="sleep-z">Z</div>
                    <div class="sleep-z delayed">Z</div>
                    <div class="sleep-z more-delayed">Z</div>
                </div>
            `
        };
        return actions[action] || '';
    }

});