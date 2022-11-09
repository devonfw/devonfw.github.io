
//Cookies

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; domain=" + location.hostname +"; secure; path=/";
}

function deleteCookie(cname) {
    document.cookie = cname + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
}

//Navbar

window.addEventListener('scroll', (e) => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > navbar.offsetHeight ) {
      navbar.classList.add('nav-active');
  } else {
      navbar.classList.remove('nav-active');
  }
});

// Overlay
  
!function () {
  'use strict'
  
  var overlay = document.querySelector('.overlay');
  var bannerBtn = document.querySelector('.banner-btn');
  var readAnnouncement = getCookie("read_announcement");

  if (!overlay) return
  if (readAnnouncement.length > 0) {
    overlay.style.display = "none";
  } else {
      overlay.addEventListener('click', () => {
      overlay.style.display = "none";
      setCookie("read_announcement", "true", 300);
    }); 
      bannerBtn.addEventListener('click', () => {
      overlay.style.display = "none";
      setCookie("read_announcement", "true", 300);
    }); 
  }
}()
  
// Burger Button
  
!function () {
  'use strict'

  var navbarBurger = document.querySelector('.navbar-burger')
  if (!navbarBurger) return
  navbarBurger.addEventListener('click', toggleNavbarMenu.bind(navbarBurger))

  function toggleNavbarMenu (e) {
    e.stopPropagation() // trap event
    document.documentElement.classList.toggle('is-clipped--navbar')
    this.classList.toggle('is-active')
    var menu = document.getElementById(this.dataset.target)
    if (menu.classList.toggle('is-active')) {
      menu.style.maxHeight = ''
      var expectedMaxHeight = window.innerHeight - Math.round(menu.getBoundingClientRect().top)
      var actualMaxHeight = parseInt(window.getComputedStyle(menu).maxHeight, 10)
      if (actualMaxHeight !== expectedMaxHeight) menu.style.maxHeight = expectedMaxHeight + 'px'
    }
  }
}()

