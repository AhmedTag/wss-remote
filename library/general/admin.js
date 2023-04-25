$(document).on("click", "a[data-child]", function (e) {
    var hasChild = $(this).attr("href");
    if (hasChild === "#") {
        e.preventDefault();
        var childNo = $(this).data("child");
        $(`li.child[data-child="${childNo}"]`).slideToggle("fast");
    }
});

$(document).ready(function () {
    $("#app__menu > li > a").each(function () {
        var thisLink = $(this).attr("href").toLowerCase();
        if (thisLink == window.location.pathname.split("/").pop().toLowerCase()) {
            $(this).addClass("active");
            return false;
        }
    });

    $("#app__menu li.child a").each(function () {
        var thisLink = $(this).attr("href").toLowerCase();
        if (thisLink == window.location.pathname.split("/").pop().toLowerCase()) {
            $(this).addClass("active");
            $(this).parents('li.child').slideDown("fast");
            $(this).parents('li.child').prev('li').find('a').addClass("active");
            //var parent = $(this).parent().data("child");
            //$(`#app__menu a[data-child="${parent}"]`).addClass("active");
            return false;
        }
    });
});

var loadFile = function (event) {
    var output = document.getElementById('prev-img');
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function () {
        URL.revokeObjectURL(output.src) // free memory
    }
};

$(document).on("click", "button[gotoAction]", function (e) {
    e.preventDefault();

    var title = $(this).attr('title');
    var actionName = $(this).attr("gotoAction").split(",")[0];
    var pageName = $(this).attr("gotoAction").split(",")[1];
    var itemID = $(this).attr("gotoAction").split(",")[2];
    var url = "actions/" + actionName + "/" + pageName + ".php?item=" + itemID;

    $("#GeneralModal #mcontent").html('<h5 class="alert alert-info text-center">الرجاء الإنتظار</h5>');
    $("#GeneralModal").modal("show");
    $("#GeneralModal #Title").text(title);
    $("#GeneralModal #mcontent").load(url);
});



function checkImage(file) {
    var name = file.name;
    var ext = name.split('.').pop().toLowerCase();
    if ($.inArray(ext, ['gif', 'png', 'jpg', 'jpeg']) == -1) {
        return false;
    } else {
        return true;
    }
}

function checkImageSize(file) {
    var oFReader = new FileReader();
    oFReader.readAsDataURL(file);
    var f = file;
    var fsize = f.size || f.fileSize;
    if (fsize > 5242880) {
        return false;
    } else {
        return true;
    }
}


$(document).on("click", ".savedata", function () {
    var text = $(this).data('text');
    var ajaxActionName = $(this).data('ajax-action-name');
    var inputName = 0;
    var formData = {};
    var errors = 0;

    $(this).parents(".inputs-container").find(".form-control[required]").each(function () {
        if ($(this).val() == "") {
            errors += 1;
        }
    });

    if (errors > 0) {
        $(".form-control:required").addClass("validation-error");
        Swal.fire("Error", "Please fill all required fields (red border)", "error");
        return false;
    }

    if (ajaxActionName == "save") {
        formData['GlobalSave'] = 'GlobalSave';
    } else if (ajaxActionName == "edit") {
        formData['GlobalEdit'] = 'GlobalEdit';
    } else if (ajaxActionName == "delete") {
        formData['GlobalDelete'] = 'GlobalDelete';
    } else {
        Swal.fire("Error", "Something went wrong - EAJX106", "error");
        return false;
    }

    $(this).parents(".inputs-container").find(".form-control:not(.ignore)").each(function () {
        inputName = $(this).attr("id");
        formData[inputName] = $(this).val();
    });

    var isThereFile = $(this).parents(".inputs-container").find('#file');
    if (isThereFile.length > 0 && isThereFile.val() != "") {
        var fileArray = document.getElementById("file").files;
        if (fileArray.length == 1) {


            if (checkImage(fileArray[0]) === false) {
                Swal.fire("Error", "Please select images only", "error");
                return false;
            }

            if (checkImageSize(fileArray[0]) === false) {
                Swal.fire("Error", "Maximum allowed file size is 5mb per image", "error");
                return false;
            }

            let file = fileArray[0];
            let reader = new FileReader();
            reader.onloadend = function () {
                formData['file'] = reader.result;
            }
            reader.readAsDataURL(file);
        } else {

            for (var x = 0; x < fileArray.length; x++) {
                if (checkImage(fileArray[x]) === false) {
                    Swal.fire("Error", "Please select images only", "error");
                    return false;
                }

                if (checkImageSize(fileArray[x]) === false) {
                    Swal.fire("Error", "Maximum allowed file size is 5mb per image", "error");
                    return false;
                }
                let reader = new FileReader();
                reader.onloadend = function () {
                    formData['file_' + x] = reader.result;
                }
                reader.readAsDataURL(fileArray[x]);
            }
        }
    }

    if (formData['password'] == "") {
        delete formData['password']
    }

    console.log(formData);

    Swal.fire({
        title: 'Confirm'
        , text: "Are you sure that you want to " + text + " ?"
        , icon: 'info'
        , showCancelButton: true
        , confirmButtonColor: '#1aa705'
        , cancelButtonColor: '#d33'
        , confirmButtonText: 'Yes, i`m sure'
        , cancelButtonText: 'No, go back'
    }).then((result) => {
        if (result.value) {
            $(this).attr("disabled", "disabled");
            $.ajax({
                type: 'POST'
                , url: '../conn/ajaxData.php'
                , data: formData
                , success: function (data) {
                    if (result.value) {
                        let timerInterval
                        Swal.fire({
                            title: 'Done'
                            , html: 'Operation successfully'
                            , timer: 500
                            , timerProgressBar: true
                            , willOpen: () => {
                                Swal.showLoading()
                            }
                            , willClose: () => {
                                clearInterval(timerInterval)
                            }
                        }).then((result) => {
                            if (result.dismiss === Swal.DismissReason.timer) {
                                window.location.reload();
                            }
                        });
                    }
                }
            });
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
            return;
        }
    });
});

function getSub(id) {
    var mainCatId = $(id).val();
    $.ajax({
        type: "GET",
        url: '../conn/ajaxData.php?getsub=' + mainCatId,
        dataType: "html",
        success: function (response) {
            $(id).parent().parent().find("#sub_cat").html(response);

            $(id).parent().parent().find("#sub_cat > option").each(function () {
                var val = $(this).attr("value");
                if (val == mainCatId) {
                    $(this).attr("selected", "selected");
                }
            });

            $('select').trigger("chosen:updated");
        }
    });
}

function updateSectionStatus(id, status) {
    $.ajax({
        type: "GET",
        url: '../conn/ajaxData.php?updateSectionStatus=' + id + "&checkStatus=" + status,
        dataType: "html",
        success: function (response) {
            swal.fire("Done", "Index section status saved", "success");
        }
    });
}

function drawMenu(x) {
    if (x == null) {
        $('a[data-has-parent="0"]').each(function() {
            $(".dynamicmenuitems").append(`<li data-item-id="${$(this).data("item-id")}"> <span>${$(this).text()}</span> 
            <button class="btn btn-sm btn-outline-dark border-0" type="button" gotoAction="create,catin,${$(this).data("item-id")}"><i class="fas fa-plus"></i></button>
            <button class="btn btn-sm btn-outline-dark border-0" type="button" gotoAction="edit,catin,${$(this).data("item-id")}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-outline-danger border-0" type="button" gotoAction="delete,cat,${$(this).data("item-id")}"><i class="fas fa-trash"></i></button>
            </li>`);
            $(".dynamicmenuitems").append(`<ul data-child-for="${$(this).data("item-id")}"></ul>`);
            drawMenu($(this).data("item-id"));
        });
    } else {
        $(`a[data-has-parent="${x}"]`).each(function() {
            $(`.dynamicmenuitems ul[data-child-for="${x}"]`).append(`<li data-item-id="${$(this).data("item-id")}"> <span>${$(this).text()}</span> 
            <button class="btn btn-sm btn-outline-dark border-0" type="button" gotoAction="create,catin,${$(this).data("item-id")}"><i class="fas fa-plus"></i></button>
            <button class="btn btn-sm btn-outline-dark border-0" type="button" gotoAction="edit,catin,${$(this).data("item-id")}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-outline-danger border-0" type="button" gotoAction="delete,cat,${$(this).data("item-id")}"><i class="fas fa-trash"></i></button>
            </li>`);
            $(`.dynamicmenuitems li[data-item-id="${$(this).data("item-id")}"]`).append(`<ul data-child-for="${$(this).data("item-id")}"></ul>`);
            drawMenu($(this).data("item-id"));
        });
    }
}

function drawMenuSelector(x) {
    if (x == null) {
        $('a[data-has-parent="0"]').each(function() {
            $(".dynamicmenuitems").append(`<li data-item-id="${$(this).data("item-id")}"> <span data-cat="${$(this).data("item-id")}">${$(this).text()}</span></li>`);
            $(".dynamicmenuitems").append(`<ul data-child-for="${$(this).data("item-id")}"></ul>`);
            drawMenuSelector($(this).data("item-id"));
        });
    } else {
        $(`a[data-has-parent="${x}"]`).each(function() {
            $(`.dynamicmenuitems ul[data-child-for="${x}"]`).append(`<li data-item-id="${$(this).data("item-id")}"> <span data-cat="${$(this).data("item-id")}">${$(this).text()}</span></li>`);
            $(`.dynamicmenuitems li[data-item-id="${$(this).data("item-id")}"]`).append(`<ul data-child-for="${$(this).data("item-id")}"></ul>`);
            drawMenuSelector($(this).data("item-id"));
        });
    }
}