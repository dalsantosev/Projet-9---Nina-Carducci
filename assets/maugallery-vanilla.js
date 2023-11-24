function mauGallery(options) {
  var mergedOptions = { ...mauGallery.defaults, ...options };
  var tagsCollection = [];

  document.querySelectorAll(".gallery").forEach(function (gallery) {
    createRowWrapper(gallery);

    if (mergedOptions.lightBox) {
      createLightBox(
        gallery,
        mergedOptions.lightboxId,
        mergedOptions.navigation
      );
    }

    listeners(mergedOptions);

    gallery.querySelectorAll(".gallery-item").forEach(function (item) {
      responsiveImageItem(item);
      moveItemInRowWrapper(item);
      wrapItemInColumn(item, mergedOptions.columns);

      var theTag = item.getAttribute("data-gallery-tag");
      if (
        mergedOptions.showTags &&
        theTag !== null &&
        tagsCollection.indexOf(theTag) === -1
      ) {
        tagsCollection.push(theTag);
      }
    });

    if (mergedOptions.showTags) {
      showItemTags(gallery, mergedOptions.tagsPosition, tagsCollection);
    }

    gallery.style.display = "block";
  });
}

mauGallery.defaults = {
  columns: 3,
  lightBox: true,
  lightboxId: null,
  showTags: true,
  tagsPosition: "bottom",
  navigation: true,
};

function listeners(options) {
  document.querySelectorAll(".gallery-item").forEach(function (item) {
    item.addEventListener("click", function () {
      if (options.lightBox && item.tagName === "IMG") {
        openLightBox(item, options.lightboxId);
      } else {
        return;
      }
    });
  });

  document
    .querySelector(".gallery")
    .addEventListener("click", function (event) {
      var target = event.target;

      if (target.classList.contains("nav-link")) {
        filterByTag(target);
      } else if (target.classList.contains("mg-prev")) {
        prevImage(options.lightboxId);
      } else if (target.classList.contains("mg-next")) {
        nextImage(options.lightboxId);
      }
    });
}

function createRowWrapper(element) {
  if (!element.firstElementChild.classList.contains("row")) {
    var row = document.createElement("div");
    row.classList.add("gallery-items-row", "row");
    element.appendChild(row);
  }
}

function wrapItemInColumn(element, columns) {
  if (typeof columns === "number") {
    var columnClasses = "item-column mb-4 col-" + Math.ceil(12 / columns);
    var column = document.createElement("div");
    column.className = columnClasses;
    element.parentNode.insertBefore(column, element);
    column.appendChild(element);
  } else if (typeof columns === "object") {
    var columnClasses = "";
    if (columns.xs) {
      columnClasses += " col-" + Math.ceil(12 / columns.xs);
    }
    if (columns.sm) {
      columnClasses += " col-sm-" + Math.ceil(12 / columns.sm);
    }
    if (columns.md) {
      columnClasses += " col-md-" + Math.ceil(12 / columns.md);
    }
    if (columns.lg) {
      columnClasses += " col-lg-" + Math.ceil(12 / columns.lg);
    }
    if (columns.xl) {
      columnClasses += " col-xl-" + Math.ceil(12 / columns.xl);
    }

    var column = document.createElement("div");
    column.className = "item-column mb-4 " + columnClasses;
    element.parentNode.insertBefore(column, element);
    column.appendChild(element);
  } else {
    console.error(
      "Columns should be defined as numbers or objects. " +
        typeof columns +
        " is not supported."
    );
  }
}

function moveItemInRowWrapper(element) {
  element.parentNode.querySelector(".gallery-items-row").appendChild(element);
}

function responsiveImageItem(element) {
  if (element.tagName === "IMG") {
    element.classList.add("img-fluid");
  }
}

function openLightBox(element, lightboxId) {
  document
    .querySelector("#" + (lightboxId || "galleryLightbox"))
    .querySelector(".lightboxImage").src = element.src;
  var lightbox = new bootstrap.Modal(
    document.querySelector("#" + (lightboxId || "galleryLightbox"))
  );
  lightbox.show();
}

function prevImage(lightboxId) {
  var activeImage = document.querySelector(".lightboxImage");
  if (!activeImage) return;

  var activeImageSrc = activeImage.src;
  var activeTag = document
    .querySelector(".tags-bar span.active-tag")
    .getAttribute("data-images-toggle");
  var imagesCollection = [];

  if (activeTag === "all") {
    document.querySelectorAll(".item-column img").forEach(function (img) {
      imagesCollection.push(img);
    });
  } else {
    document.querySelectorAll(".item-column img").forEach(function (img) {
      var imgTag = img.getAttribute("data-gallery-tag");
      if (imgTag === activeTag) {
        imagesCollection.push(img);
      }
    });
  }

  var currentIndex = imagesCollection.findIndex(function (img) {
    return img.src === activeImageSrc;
  });

  var newIndex = currentIndex - 1;
  if (newIndex < 0) newIndex = imagesCollection.length - 1;

  activeImage.src = imagesCollection[newIndex].src;
}

function nextImage(lightboxId) {
  var activeImage = document.querySelector(".lightboxImage");
  if (!activeImage) return;

  var activeImageSrc = activeImage.src;
  var activeTag = document
    .querySelector(".tags-bar span.active-tag")
    .getAttribute("data-images-toggle");
  var imagesCollection = [];

  if (activeTag === "all") {
    document.querySelectorAll(".item-column img").forEach(function (img) {
      imagesCollection.push(img);
    });
  } else {
    document.querySelectorAll(".item-column img").forEach(function (img) {
      var imgTag = img.getAttribute("data-gallery-tag");
      if (imgTag === activeTag) {
        imagesCollection.push(img);
      }
    });
  }

  var currentIndex = imagesCollection.findIndex(function (img) {
    return img.src === activeImageSrc;
  });

  var newIndex = currentIndex + 1;
  if (newIndex >= imagesCollection.length) newIndex = 0;

  activeImage.src = imagesCollection[newIndex].src;
}

function createLightBox(gallery, lightboxId, navigation) {
  var modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.innerHTML = `
          <div class="modal-body">
            ${
              navigation
                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                : '<span style="display:none;" />'
            }
            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
            ${
              navigation
                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                : '<span style="display:none;" />'
            }
          </div>
        `;

  var modal = document.createElement("div");
  modal.classList.add("modal", "fade");
  modal.id = lightboxId || "galleryLightbox";
  modal.tabIndex = -1;
  modal.role = "dialog";
  modal.ariaHidden = true;
  modal
    .appendChild(document.createElement("div"))
    .classList.add("modal-dialog");
  modal.querySelector(".modal-dialog").appendChild(modalContent);

  gallery.appendChild(modal);
}

function showItemTags(gallery, position, tags) {
  var tagItems = `
          <li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>
        `;

  tags.forEach(function (tag) {
    tagItems += `
            <li class="nav-item active">
              <span class="nav-link" data-images-toggle="${tag}">${tag}</span>
            </li>
          `;
  });

  var tagsRow = document.createElement("ul");
  tagsRow.classList.add("my-4", "tags-bar", "nav", "nav-pills");
  tagsRow.innerHTML = tagItems;

  if (position === "bottom") {
    gallery.appendChild(tagsRow);
  } else if (position === "top") {
    gallery.insertBefore(tagsRow, gallery.firstChild);
  } else {
    console.error("Unknown tags position: " + position);
  }
}

function filterByTag(clickedTag) {
  if (clickedTag.classList.contains("active-tag")) {
    return;
  }

  var activeTags = document.querySelectorAll(".active.active-tag");
  activeTags.forEach(function (tag) {
    tag.classList.remove("active", "active-tag");
  });

  clickedTag.classList.add("active-tag", "active");
  var tag = clickedTag.getAttribute("data-images-toggle");

  document.querySelectorAll(".gallery-item").forEach(function (item) {
    item.closest(".item-column").style.display = "none";
    if (tag === "all") {
      item.closest(".item-column").style.display = "block";
    } else if (item.getAttribute("data-gallery-tag") === tag) {
      item.closest(".item-column").style.display = "block";
    }
  });
}
export default mauGallery;
