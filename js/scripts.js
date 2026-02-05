/*!
* Start Bootstrap - Grayscale v7.0.3 (https://startbootstrap.com/theme/grayscale)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-grayscale/blob/master/LICENSE)
*/
//
// Scripts
// 

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

    //Get the button
    let mybutton = document.getElementById("btn-back-to-top");

    // When the user scrolls down 20px from the top of the document, show the button
    window.onscroll = function () {
        scrollFunction();
    };

    function scrollFunction() {
        if (
            document.body.scrollTop > 20 ||
            document.documentElement.scrollTop > 20
        ) {
            mybutton.style.display = "block";
        } else {
            mybutton.style.display = "none";
        }
    }
    // When the user clicks on the button, scroll to the top of the document
    mybutton.addEventListener("click", backToTop);

    function backToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    // Travel map photo data
    const travelData = {
        tahiti: [
            'assets/img/tahiti1.jpg',
            'assets/img/tahiti2.jpg', 
            'assets/img/tahiti3.jpg'
        ],
        peru: [
            'assets/img/peru1.jpg',
            'assets/img/peru2.jpg',
            'assets/img/peru3.jpg'
        ],
        australia: [
            'assets/img/australia1.jpg',
            'assets/img/australia2.jpg',
            'assets/img/australia3.jpg'
        ],
        europe: [
            'assets/img/europe1.jpg',
            'assets/img/europe2.jpg',
            'assets/img/europe3.jpg'
        ]
    };

    // Travel marker interactions
    document.querySelectorAll('.travel-marker').forEach(marker => {
        marker.addEventListener('mouseenter', function(e) {
            const location = this.dataset.location;
            const photos = travelData[location];
            const container = document.getElementById('travelPhotos');
            const photoElements = container.querySelectorAll('.travel-photo');
            
            photoElements.forEach((img, idx) => {
                img.src = photos[idx];
                img.alt = `${location} photo ${idx + 1}`;
            });
            
            container.style.display = 'block';
            
            // Position near marker
            const rect = e.target.getBoundingClientRect();
            container.style.position = 'absolute';
            container.style.left = rect.left + 'px';
            container.style.top = (rect.top + 30) + 'px';
        });
        
        marker.addEventListener('mouseleave', function() {
            setTimeout(() => {
                if (!document.getElementById('travelPhotos').matches(':hover')) {
                    document.getElementById('travelPhotos').style.display = 'none';
                }
            }, 200);
        });
    });

});