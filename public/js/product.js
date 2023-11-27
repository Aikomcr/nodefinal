$(document).ready(function(){

	$('.category-list .category-items[category="all"]').addClass('ct-items-active');

	$('.category-items').click(function(){
		var catProduct = $(this).attr('category');
		console.log(catProduct);

		$('.category-items').removeClass('ct-items-active');
		$(this).addClass('ct-items-active');

		$('.product-items').css('transform', 'scale(0)');
		function hideProduct(){
			$('.product-items').hide();
		} setTimeout(hideProduct,400);

		function showProduct(){
			$('.product-items[category="'+catProduct+'"]').show();
			$('.product-items[category="'+catProduct+'"]').css('transform', 'scale(1)');
		} setTimeout(showProduct,400);
	});

	$('.category-items[category="all"]').click(function(){
		function showAll(){
			$('.product-items').show();
			$('.product-items').css('transform', 'scale(1)');
		} setTimeout(showAll,400);
	});
});