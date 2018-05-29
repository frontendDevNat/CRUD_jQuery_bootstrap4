$(function () {
	let needRow;
	let needId;
	let tblProducts = JSON.parse(localStorage.getItem("tblProducts"));
	$.getJSON('data.json', function (data) {//get json file via ajax method of jquery
		for (let i of data) {
			createRows(i);
		}
		tblProducts = data;
		localStorage.setItem("tblProducts", JSON.stringify(tblProducts));//save changes in the local store
	});


	$('#table tbody').delegate('.edit', 'click', function () {//click on the dynamically added buttons
		$('#form input[data-target="check"]').removeClass('is-invalid');
		needRow = $(this).closest('tr');
		needId = needRow.attr('id');
		inpForm(needId, tblProducts);
		$('#form input[data-target="check"]').on('focusout', function () {
			validate($(this))
		});
		$('#btnAdd').removeClass('add').addClass('edit');
		$('#btnAdd').attr('value', 'Update').removeAttr('data-dismiss');
	});


	$('#table tbody').delegate('.delete', 'click', function () {
		let row = $(this);
		let id = row.closest('tr').attr('id');
		$('#confirm ').on('click', function () {
			rowDelete(row, id, tblProducts);
			localStorage.setItem("tblProducts", JSON.stringify(tblProducts));//save changes in the local store
		});
	});

	$('#addNew').on('click', function () {
		$('#form input[data-target="check"]').removeClass('is-invalid');
		$('#form')[0].reset();
		$('#form input[data-target="check"]').on('focusout', function () {
			validate($(this))
		});
		$('#btnAdd').removeClass('edit').addClass('add').removeAttr('data-dismiss');
		$('#btnAdd').attr('value', 'Add');
	});

	$('#btnAdd').on('click', function () {
		if (this.classList.contains('add')) {//case of add new row
			if (!validate($('input[data-target="check"]'))) {
				addRow(tblProducts);//method for add
				localStorage.setItem("tblProducts", JSON.stringify(tblProducts));//save changes in the local store
				$(this).attr('data-dismiss', 'modal'); //close the modal window
			}

		} else if (this.classList.contains('edit')) {//case of edit row
			if (!validate($('input[data-target="check"]'))) {
				needRow.remove();//remove element from DOM
				editRow(needId, tblProducts);//method for edit
				localStorage.setItem("tblProducts", JSON.stringify(tblProducts));
				$(this).attr('data-dismiss', 'modal');//close the modal window
			}
		}
		;
	});

	//filter of products
	$('#searchName').on('submit', function (e) {
		e.preventDefault();
		let filterName = $('#searchName input[type="search"]').val().toLowerCase();
		$("#table").find("tr").each(function (index) {
			if (!index) return;
			let id = $(this).find('td').first().text();
			$(this).toggle(id.indexOf(filterName) !== -1);
			console.log(id.indexOf(filterName));
		});
	});

	//sort by product name
	$('#sortName').on('click', function () {
		let spanName = $(this);
		spanName.toggleClass('upName');
		let orderName;
		if (spanName.is('.upName')) {
			spanName.html('▽').attr('title', 'sort down');
			orderName = tblProducts.sort((a, b) => a.name > b.name ? -1 : 1);
		} else {
			orderName = tblProducts.sort((a, b) => a.name > b.name ? 1 : -1);
			spanName.html('△').attr('title', 'sort up');
		}
		$('tbody tr').remove();
		$.each(orderName, function (key) {
			createRows(orderName[key]);
		})
	});

	//sort by product price
	$('#sortPrice').on('click', function () {
		let spanPrice = $(this);
		spanPrice.toggleClass('upPrice');
		let orderPrice;
		if (spanPrice.is('.upPrice')) {
			spanPrice.html('▽').attr('title', 'sort down');
			orderPrice = tblProducts.sort((a, b) => a.price > b.price ? -1 : 1);
		} else {
			orderPrice = tblProducts.sort((a, b) => a.price > b.price ? 1 : -1);
			spanPrice.html('△').attr('title', 'sort up');
		}
		$('tbody tr').remove();
		$.each(orderPrice, function (key) {
			createRows(orderPrice[key]);
		})
	});

});


//Methods
    //create new row like DOM element
	function createRows(data) {
		let formMPrice = accounting.formatMoney(data.price);
		//writing code by ES 5 and earlier versions
		/* $('#table tbody').append('<tr id="' + data.id + '">' + '<td class="nameProduct">' + data.name + '</td><td><div class="badge badge-pill badge-secondary justify-content-center">' + data.count + '</div>' +
		'</td><td class="text-center">' + formMPrice + '</td><td class="d-flex justify-content-center"><button type="button" class="btn btn-success edit mr-4" data-toggle="modal" data-target="#createItem">Edit</button><button type="button" class="btn btn-success delete" data-toggle="modal" data-target="#deleteItem"> Delete</button></td><tr>');
		*/
		//writing code by ES 6
		$('#table tbody').append(`<tr id=${data.id}><td class="nameProduct">${data.name}</td>
		<td><div class="badge badge-pill badge-secondary justify-content-center">${data.count}</div></td>
		<td class="text-center">${formMPrice} </td>
		<td class="d-flex justify-content-center">
		<button type="button" class="btn btn-success edit mr-4" data-toggle="modal" data-target="#createItem">Edit</button>
		<button type="button" class="btn btn-success delete" data-toggle="modal" data-target="#deleteItem"> Delete</button></td><tr>`);
	}

	//delete row from table
    function rowDelete(el, id, arr) {
        el.closest('tr').remove();//delete from table
        $.each(arr, function (key) {//delete from data array
            if (this.id == id) {
                arr.splice(key, 1);
            }
        });
    }

	//find out maximum of the id in order to get id for new row
	function maxId(arr) {
		let arrId = [];
		$.each(arr, function (key) {
			arrId.push(arr[key].id)
		});
		let maxId = Math.max.apply(null, arrId);
		return ++maxId;
	}

	//add new row
	function addRow(arr) {
		let newId = maxId(arr);
		let newRow = {
			id: newId,
			name: $('input[data-validation ="name"]').val(),
			count: $('input[data-validation ="count"]').val(),
			price: $('input[data-validation ="price"]').val()
		};
		arr.push(newRow);
		let filterName = $('#searchName input[type="search"]').val().toLowerCase();
		$("#table").find("tr").each(function(index) {
			if (!index) return;
			var id = $(this).find("td").first().text();
			$(this).toggle(id.indexOf(filterName) !== -1);
		});
		createRows(newRow);
	}

	//fill in form of the modal window for add/edit row
	function inpForm(id, arr) {
		$.each(arr, function(key){
            if(this.id == id){
	            $('input[data-validation ="name"]').val(arr[key].name);
	            $('input[data-validation ="count"]').val(arr[key].count);
	            String($('input[data-validation ="price"]').val(arr[key].price));
            }
        })
	}

	//edit row
	function editRow(id, arr) {
		$.each(arr, function (key) {
			if(this.id == id) {
				arr[key] = {
					id: arr[key].id,
					name: $('input[data-validation ="name"]').val(),
					count: Number($('input[data-validation ="count"]').val()),
					price: Number($('input[data-validation ="price"]').val())
				};
				createRows(arr[key]);
			}
		});
	}

	//validation of form add/edit row
	function validate(arr) {
    let patterns = {
        name: /^([A-Za-z\d][\s]{0,2}){1,15}$/i,
        count: /^[0-9]+$/,
        price: /^\d+(\.\d{0,2})*$/
    };
	let err = false;
	let msg = "";
	$.each(arr, function (key) {
				let value = $(this).val();
		let patternName = $(this).attr('data-validation');
		console.log(patternName);
		let pattern = patterns[patternName];
		if (!pattern.test(value)) {
			console.log(pattern.test(value));

			$(this).addClass('is-invalid');
			err = true;

			if(value == ""){
				msg = "The field can not be empty";
			}else if(patternName == "name" && value.length > 15) {
				msg = "Amount of symbols can not be more 15";
			}else if(patternName == "count" || patternName == "price"){
				msg = "The field can consist only numbers";
			}else{
				msg = "The field can not consist only spaces"
			}
			$(this).next('div').html(msg);
		}
		else {
			$(this).next('div').html("");
			$(this).removeClass('is-invalid');
		}
	});
		return err;
	}