let firstTime = true;

let add = val => { 
    if (val === "." && firstTime && $('#result').val().length !== 0) {
        $('#result').val($('#result').val() + val);
        firstTime = false ;
    } else if (firstTime && !(val === "0") && !(val === ".")) {
        $('#result').val(val);
        firstTime = false ;
    } else {
        if($('#result').val().length === 0 && !(val === "0") && !(val === ".")) {
            $('#result').val($('#result').val() + val);
        } else if (!($('#result').val().includes(".")) && $('#result').val().length < 2 && $('#result').val().length !== 0) {
            $('#result').val($('#result').val() + val);
        } else if (document.getElementById("result").value.length === 2 && val === "." && !($('#result').val().includes("."))) {
            $('#result').val($('#result').val() + val);
        } else if ($('#result').val().includes(".") && $('#result').val().split(".")[0].length === 2 && $('#result').val().length < 5 && !(val === ".")) {
            $('#result').val($('#result').val() + val);
        } else if ($('#result').val().includes(".") && $('#result').val().length < 4 && !(val === ".")){
            $('#result').val($('#result').val() + val);
        } else {
            $('#result').popover('show');
            $('.btnBuy').prop("disabled", true);
        }
    }
    setButtonDisability()
}

//function that deletes one char from result
let remove = () => {
    $('#result').val($('#result').val().substring(0, $('#result').val().length - 1));
    if($('#result').val().length === 0) {
        $('#result').popover('show');
        $('.btnBuy').prop("disabled", true);
    }
    setButtonDisability()
} 

let setButtonDisability = () => {
    if (parseFloat($('#result').val()) >= 1.00 && parseFloat($('#result').val()) <= 99.99) {
        $('.btnBuy').prop("disabled", false);
    }
}