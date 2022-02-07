document.addEventListener("DOMContentLoaded", function(event) {

    document.querySelector('.sectlevel2').previousElementSibling.setAttribute("id", "actSectLev");
    document.getElementById("actSectLev").setAttribute("style","--link-to-chevron: url('/images/mdi_chevron-right@1x.png')");


    let sections = document.querySelectorAll(".sectlevel3 a");

    let sectHref = sections[0].getAttribute('href');
    sectHref  = sectHref.split("#").pop();


    let sectId = document.querySelectorAll(".sect3 h4");

    sections = sectId;

    //include li-a-tag for Content headline over right menu
    document.getElementsByClassName('sectlevel3')[0].innerHTML += '<li id="content-caption-li"> <a id="content-caption" class="" href="">Content</a> </li>';

    document.getElementsByClassName('sectlevel3')[0].prepend(document.getElementById('content-caption-li'))

    const sectlevA = document.querySelectorAll('.sectlevel3 li a');
    let flag = 0;

    window.addEventListener('scroll', ()=> {
        let current = '';

        sections.forEach( section => {
            const sectionTop = section.offsetTop;
            if( scrollY >= sectionTop) 
            {
                current = section.getAttribute('id');
            }
        })

        //adding id to current sectlevel3-heading element on the right sight
        sectlevA.forEach( a => {
            if(a.getAttribute('id') != 'content-caption')
            {
            a.classList.remove('activeLine');
            flag = 0;
            if(a.getAttribute('href').split("#").pop() == current)
                {
                    document.getElementsByClassName('activeLine');
                    a.classList.add('activeLine');
                    flag  = 1;
                }
            }
            
        })
    })

})
