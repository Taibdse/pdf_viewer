const url = '../docs/pdf.pdf';

let pdfDoc = null;
let pageNum = 1;
let pageIsRendering = false;
let pageNumIsPending = null;

const scale = 1.5;
let canvas = document.querySelector('#pdf-render');
let ctx = canvas.getContext('2d');

//Render the page
const renderPage = num => {
    pageIsRendering = true;

    //Get the page
    pdfDoc.getPage(num).then(page => {
        // console.log(page);
        // Set Scale
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport
        }

        page.render(renderContext).promise.then(() => {
            pageIsRendering = false;

            if(pageNumIsPending !== null){
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        //Output current page
        document.querySelector('#page-num').textContent = num;

    })
}

//Check for pages rendering
const queueRenderPage = num => {
    if(pageIsRendering){
        pageNumIsPending = num;
    }else{
        renderPage(num);
    }
}

const showPrevPage = () => {
    if(pageNum <= 1){
        return
    }
    pageNum--;
    queueRenderPage(pageNum);
}

const showNextPage = () => {
    if(pageNum >= pdfDoc.numPages){
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

//get the document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    // console.log(pdfDoc);
    document.querySelector('#page-count').textContent = pdfDoc.numPages;
    renderPage(pageNum);
})
.catch(err => {
    //Display error
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);
    //Remove top bar
    document.querySelector('.top-bar').style.display = 'none';
})

document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);