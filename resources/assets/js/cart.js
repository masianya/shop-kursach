import toastr from 'toastr';
toastr.options.closeButton = true;
toastr.options.onclick = function() { toastr.clear() };

let modal_cart = $('#cart'),
    cart_content = $('#cart_body');

$('.get-cart').click(function () {
    modal_cart.modal('show');
    $.ajax({
        type: "GET",
        url: '/cart/get',
        dataType: 'text',
        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')}
    }).done(function (data) {
        cart_content.html(data);
        modal_cart.modal('show');
    }).fail(function () {
        console.log('fail');
    });
});

//buy
$('.add-to-cart-button').click(function () {
    let id = $(this).data('id'),
        size = $('#select-size').val(),
        cart_count = $('.cart-count');

    if (size) {
        $.ajax({
            type: "GET",
            url: '/cart/add',
            data: {id: id, size: size},
            dataType: 'json',
            headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')}
        }).done(function (data) {
            $('.order').attr("disabled", false);
            cart_count.html(data.totalQty);
            console.log();
            toastr.success('Was added to cart!', data.lastItem + '(' + data.size + ')')
        }).fail(function () {
            console.log('fail');
        });
    } else {
        swal({
            title: "Please select size!",
            icon: "warning",
        });
    }
});

//delete from cart
modal_cart.on('click', '.delete', function () {
    let id = $(this).data('id');
    deleteFromCart(id);
});

function deleteFromCart(id) {
    $.ajax({
        type: "GET",
        url: '/cart/remove',
        data: {id: id},
        dataType: 'json',
        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')}
    }).done(function (data) {
        $('#cart-item-' + id).slideUp('slow');

        $('.cart-total-price').html(data.totalPrice);
        $('.cart-total-count').html(data.totalQty);
        $('.cart-count').html(data.totalQty);

        if (data.totalQty == 0) {
            $('.order').attr("disabled", true);
            emptyCart();
        }
    }).fail(function () {
        console.log('fail');
    });
}

function emptyCart() {
    $.ajax({
        type: "GET",
        url: '/cart/get',
        dataType: 'text',
        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')}
    }).done(function (data) {
        cart_content.html(data);
    });
}

modal_cart.on('click', '.minus', function () {
    let qty_el = $(this).parent().find('.qty'),
        qty = parseInt(qty_el.val()) - 1,
        id = qty_el.data('id');
    console.log(qty);
    if (qty <= 0) {
        deleteFromCart(id);
    } else {
        changeQty(id, qty);
        qty_el.val(qty);
    }
});

modal_cart.on('click', '.plus', function () {
    var qty_el = $(this).parent().find('.qty'),
        qty = parseInt(qty_el.val()) + 1,
        id = qty_el.data('id');
    qty_el.val(qty);
    changeQty(id, qty);
});

modal_cart.on('change', '.qty', function () {
    var id = $(this).data('id'),
        qty = $(this).val();
    if (qty <= 0) {
        deleteFromCart(id)
    } else {
        changeQty(id, qty);
    }
});

modal_cart.on('click', '#checkout_btn', function () {
    window.location.href = "/checkout";
});

function changeQty(id, qty) {
    $.ajax({
        type: "GET",
        url: '/cart/item_count',
        data: {id: id, qty: qty},
        dataType: 'json',
        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')}
    }).done(function (data) {
        $('.cart-total-price').html(data.totalPrice);
        $('.cart-total-count').html(data.totalQty);
        $('cart-count').html(data.totalQty);
    }).fail(function () {
        console.log('fail');
    });
}