$(window).on("load", function(){

	// checkboxイベントの設定
	$(document).on('change', 'input[type="checkbox"]', function() {
		if ($(this).val()=="allCheck") {
			if ($(this).prop('checked')) {
				for(var i=1; i<=30; i++){
					var selectCheckbox = document.getElementById("word"+i);
					selectCheckbox.style.opacity = 1;
				};
				$('input[type="checkbox"]').prop('checked', this.checked);
			} else {
				for(var i=1; i<=30; i++){
					var selectCheckbox = document.getElementById("word"+i);
					selectCheckbox.style.opacity = 0;
				};
				$('input[type="checkbox"]').prop('checked', this.checked);
			}
		} else {
			var selectedCheckbox = document.getElementById($(this).val());
			if ($(this).prop('checked')) {
				selectedCheckbox.style.opacity = 1;
			} else {
				selectedCheckbox.style.opacity = 0;
			}
		};
	});

});