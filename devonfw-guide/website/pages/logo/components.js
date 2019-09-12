export let renderModule = (function() {
    function firstSection(model) {
        let content = `
                        <div class="row">
                            <div class="col-12 col-lg-6">
                                <p class="size-first-title font-weight-bold">${model.title1}</p>
                                <p class="size-second-title">${model.title2}</p>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-6 col-md-3 col-lg-2">
                                <button type="button" class="btn btn-block custom-button blue-button">${model.firstButtonText}</button>
                            </div>
                            <div class="col-6 col-md-3 col-lg-2">
                                <button type="button" class="btn btn-block custom-button white-button">${model.secondButtonText}</button>
                            </div>
                        </div>
                    `
        $('#first-section').html(content);
        $('#logo-page .bg-image').css('background-image', 'url("../../images/' + model.bgImage + '")')
    }

    function secondSection(model) {
        let content = `
                        <div class="row">
                            <div class="col-12 col-lg-5">
                                <p class="m-0 custom-text-blue size-1">${model.title1}</p>
                                <p class="font-weight-bold size-1-5">${model.title2}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12 col-lg-5">
                                <p class="size-1">${model.text1}</p>
                            </div>
                            <div class="col-12 col-lg-5 offset-lg-2">
                                <p class="size-1">${model.text2}</p>
                            </div>
                        </div>
                    `
        $('#second-section').html(content);
    }

    function thirdSection(model) {
        let images = '';

        model.logoIcons.forEach(element => {
            images += `                            
                        <div class="col-6 col-md-3 my-5 text-center">
                            <img src="../../images/${element}">
                        </div>
                    `
        });

        let content = `            
                        <div class="row">
                            ${images}
                        </div>
                    `
        $('#third-section').html(content);
    }

    function fourthSection(model) {
        let cards = '';

        model.cards.forEach(elem => {
            cards += `
                        <div class="col-12 col-md-6 col-lg-4 py-3">
                            <a class="custom-link-card" href="${elem.link.href}" target="_blank">
                                <div class="card h-100 custom-card">
                                    <div class="row no-gutters m-auto">
                                        <div class="col-md-4 d-flex justify-content-center align-items-center">
                                            <img src="../../images/${elem.image}" class="card-img custom-card-img">
                                        </div>
                                        <div class="col-md-8 m-auto">
                                            <div class="card-body">
                                                <h5 class="card-title font-weight-bold mb-0 size-17">${elem.title}</h5>
                                                <p class="card-text my-1 size-16">${elem.description}</p>
                                                <p class="card-text custom-text-blue link-decoration size-17">${elem.link.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    `
        })

        let content = `
                        <div class="row px-lg-5">
                            <div class="col-12">
                                <p class="text-center font-weight-bold size-1-5">${model.title1}</p>
                            </div>
                        ${cards}
                        </div>
                    `
        $('#fourth-section').html(content);
    }

    function fifthSection(model) {
        let slidesIndicators = '';
        let slides = '';

        model.slides.forEach((elem, index) => {
            slidesIndicators += `
                                    <li class="custom-indicators ${index === 0 ? 'active' : ''}" data-target="#cap-slider" data-slide-to="${index}"></li>
                            `

            slides += `
                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                            <div class="container">
                                <div class="row pb-5">
                                    <div class="col-12 col-md-10 offset-md-10 col-lg-8 offset-lg-2">
                                        <p class="text-center size-20 custom-slider-text-blue">${elem.text1}</p>
                                    </div>
                                    <div class="col-12 col-md-10 offset-md-10 col-lg-8 offset-lg-2">
                                        <p class="text-center size-20">${elem.text2}</p>
                                    </div>
                                    <div class="col-12 col-md-10 offset-md-10 col-lg-8 offset-lg-2">
                                        <p class="text-center size-13">${elem.text3}</p>
                                        <p class="text-center size-13 custom-grey">${elem.text4}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
        })

        let content = `
                        <div id="cap-slider" class="carousel slide" data-ride="carousel">
                            <ol class="carousel-indicators">
                                ${slidesIndicators}
                            </ol>
                            <div class="carousel-inner custom-carousel-height">
                                ${slides}
                            </div>
                        </div>
                    `
            //$('#fifth-section').html(content);
        $('#fifth-section .carousel-indicators').html(slidesIndicators);
        $('#fifth-section .carousel-inner').html(slides);
    }

    function sixthSection(model) {
        let infoBlocks = '';

        model.infoBlocks.forEach(elem => {
            let links = '';
            elem.links.forEach(link => {
                links += `<li><a class="custom-grey" href="${link.href}" target="_blank">${link.text}</a></li>`
            })
            infoBlocks += `                
                            <div class="col-12 col-md-6 col-lg-3">
                                <div class="col-9 offset-3">
                                    <h5>${elem.title}</h5>
                                    <ul class="list-unstyled">
                                        ${links}
                                    </ul>
                                </div>
                            </div>
                        `
        });

        let content = `            
                        <div class="row">
                            ${infoBlocks}
                        </div>
                    `
        $('#sixth-section').html(content);
    }

    function seventhSection(model) {
        let links = '';

        model.links.forEach(link => {
            links += `<a class="custom-grey mr-3" href="${link.text}" target="_blank">${link.text}</a>`
        });

        let content = `            
                        <div class="row">
                            <div class="col-12">
                                <div class="col-11 offset-1">
                                ${links}
                                </div>
                            </div>
                        </div>
                    `
        $('#sevent-section').html(content);
    }


    return {
        firstSection: firstSection,
        secondSection: secondSection,
        thirdSection: thirdSection,
        fourthSection: fourthSection,
        fifthSection: fifthSection,
        sixthSection: sixthSection,
        seventhSection: seventhSection
    }
}())