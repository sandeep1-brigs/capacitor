import $ from 'jquery';

import { getSignedUrl } from './utility.js';
import { shared , s3PrivateUrl } from './globals.js';


let totalPages = 1; 
let currentPage = 1;
let pageActionCallback = "";

export function createList(listType, pageTitle, listItems, pageable, pageCount, destin, onclickAction, pageAction, displayStyle, actionAreaStyle='') {
    var htmlContent = "";

    htmlContent += pageTitle;

    if(listItems != null && listItems.length>0) {
        htmlContent += '<div class="listGridArea" id="listGridArea_'+listType+'">';
        function getNextItem(index) {
            let listItem = listItems[index];
            //let title = "";
            //let description = "";
            //if(listType == "asset") {
            //   title = listItem.assetName;
            //    description = '<div>'+listItem.description+'</div><div>'+listItem.codeId+'</div>';
            //}

                htmlContent += '<div class="listBoxArea" >';

                let boxAreaClass = "ticketStyleBoxContentArea";
                let imageAreaClass = "ticketStyleImageArea";
                let imageStyleClass = "ticketStyleImage";
                let textAreaClass = "ticketStyleTextArea";
                let titleClass = "ticketStyleTitle";
                let descriptionClass = "ticketStyleDescription";
                if(displayStyle == "cardStyle") {
                    boxAreaClass = "cardStyleBoxContentArea"
                    imageAreaClass = "cardStyleImageArea";
                    imageStyleClass = "cardStyleImage";
                    textAreaClass = "cardStyleTextArea";
                    titleClass = "cardStyleTitle";
                    descriptionClass = "cardStyleDescription";
                }

                if(listItem.clickAction != undefined && listItem.clickAction.length > 0) {
                    htmlContent += '<div class="'+boxAreaClass+'" onclick="'+listItem.clickAction+'">';
                } else if(onclickAction != undefined && onclickAction.length > 0) {
                    htmlContent += '<div class="'+boxAreaClass+'" onclick="'+onclickAction+'('+index+')">';
                } else {
                    htmlContent += '<div class="'+boxAreaClass+'" >';
                }

                    
                    htmlContent += '<div class="'+imageAreaClass+'">';
                        if(listItem.image != null && listItem.image.startsWith("<")) {
                            htmlContent += listItem.image;
                        } else {
                            htmlContent += '<img class="listBoxImage '+imageStyleClass+'" id="am_list_image_'+listItem.id+'" data-imageurl="'+listItem.image+'" src="./img/noimage.jpg" onerror="this.onerror=null;this.src=\'./img/noimage.jpg\';">';
                        }
                    htmlContent += '</div>';
                    htmlContent += '<div class="'+textAreaClass+'">';
                        htmlContent += '<div class="listBoxStateArea">';
                        if(listItem.states != undefined && listItem.states != null && listItem.states.length > 0) {
                            for(let state of listItem.states) {
                                htmlContent += '<div class="stateTextBox '+state.type+'">'+state.text+'</div>';
                            }
                        }
                        htmlContent += '</div>';
                        htmlContent += '<div class="'+titleClass+'">'+listItem.title+'</div>';
                        htmlContent += '<div class="'+descriptionClass+'">'+listItem.description+'</div>';
                    htmlContent += '</div>';

                htmlContent += '</div>';

                htmlContent += '<div class="listBoxActionArea" style="'+actionAreaStyle+'">';
                    if(listItem.actions != null && listItem.actions.length > 0) {
                        for(let action of listItem.actions) {
                            if(action.type == "button") {
                                const exists = listItem.activeActions.some(item => item.text === action.text)
                                let icon = action.text;
                                if(action.icon != undefined && action.icon !=null && action.icon.length > 0) {
                                    icon = action.icon;
                                }
                                if(exists) {
                                    htmlContent += '<div class="listBoxActionButton '+action.actionClass+'" onclick="'+action.act+'">'+icon+'</div>';
                                } else {
                                    htmlContent += '<div class="listBoxActionButton">'+icon+'</div>';
                                }
                            } else {
                                if(action.content != undefined && action.content != null && action.content.length > 0) {
                                    htmlContent += '<div>'+action.content+'</div>';
                                }
                            }
                        }
                    }
                htmlContent += '</div>';
            
            htmlContent += '</div>';

            if(index < listItems.length-1) {
                getNextItem(index+1);

            } else {
                htmlContent += '</div>';    // Closing listGridArea

                if(pageable != null) {
                    htmlContent += '<div class="pagination">';
                        htmlContent += '<button id="pagePrevBtn" class="paginationbutton" onclick="paginationChangePage(-1)" disabled>Previous</button>';
                        htmlContent += '<select id="pageSelect" class="paginationselect" onchange="paginationGoToPage()"></select>';
                        htmlContent += '<button id="pageNextBtn" class="paginationbutton" onclick="paginationChangePage(1)">Next</button>';
                    htmlContent += '</div>';
                }

                $("#"+destin).html(htmlContent);

                if(pageable != null) {
                    totalPages = pageCount;
                    currentPage = pageable.pageNumber+1;
                    pageActionCallback = pageAction;

                    populatePaginationDropdown();
                    updatePaginationButtons();
                }

                let parent = document.getElementById(destin);
                var imageElems = parent.getElementsByClassName("listBoxImage");
                if(imageElems != null && imageElems.length > 0) {
                    function getNextImg(imageIndex) {
                        var imageElem = imageElems[imageIndex];

                        var objectKey = imageElem.dataset.imageurl;
                        if(objectKey != null && objectKey.length > 0) {
                            if(objectKey.startsWith(s3PrivateUrl)) {
                                objectKey = objectKey.replace(s3PrivateUrl, "");
                                console.log("objectKey: "+objectKey);
                                //objectKey = "bveu_resource/BRIGS/assetmate_images/am_1_FE12345_templatebox_1_1__inputImage_33.jpg";
                
                                getSignedUrl(objectKey, 10).then(url => {
                                    if(url.startsWith("https://")) {
                                        imageElem.src = url;
                                    }
                                });
                            } else {
                                imageElem.src = objectKey;
                            }
                        }

                        if(imageIndex < imageElems.length-1) {
                            getNextImg(imageIndex+1);
                        }
                    }
                    getNextImg(0);
                }
            }

        }
        getNextItem(0);
    }
}

function populatePaginationDropdown() {
    const pageSelect = document.getElementById("pageSelect");
    
    for (let i = 1; i <= totalPages; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.textContent = "Page " + i;
        pageSelect.appendChild(option);
    }
    pageSelect.value = currentPage;
}

function updatePaginationButtons() {
    const prevBtn = document.getElementById("pagePrevBtn");
    const nextBtn = document.getElementById("pageNextBtn");
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function paginationChangePage(step) {
    const pageSelect = document.getElementById("pageSelect");
    
    currentPage += step;
    pageSelect.value = currentPage;
    updatePaginationButtons();
    eval(pageActionCallback+'('+currentPage+','+50+')');
}

function paginationGoToPage() {
    const pageSelect = document.getElementById("pageSelect");
    
    currentPage = parseInt(pageSelect.value);
    updatePaginationButtons();
    eval(pageActionCallback+'('+currentPage+','+50+')');
}

window.createList = createList;
window.paginationChangePage = paginationChangePage;
window.paginationGoToPage = paginationGoToPage;


