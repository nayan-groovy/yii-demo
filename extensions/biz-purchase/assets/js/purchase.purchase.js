/* 
 * Autor mdmunir <misbahuldmunir@gmail.com>
 */

yii.purchase = (function($) {
    var $grid, $form, template, counter = 0;
    var local = {
        addItem: function(item) {
            var has = false;
            $('#detail-grid > tbody > tr').each(function() {
                var $row = $(this);
                if ($row.find('input[data-field="id_product"]').val() == item.id) {
                    has = true;
                    var $qty = $row.find('input[data-field="purch_qty"]');
                    if ($qty.val() == '') {
                        $qty.val('2');
                    } else {
                        $qty.val($qty.val() * 1 + 1);
                    }
                }
            });
            if (!has) {
                var $row = $(template.replace(/_index_/g, counter++));
                $row.find('span.cd_product').text(item.cd);
                $row.find('span.nm_product').text(item.text);
                $row.find('input[data-field="id_product"]').val(item.id);
                $row.find('input[data-field="purch_qty"]').val('1');
                var $select = $row.find('select[data-field="id_uom"]').html('');
                $.each(item.uoms, function() {
                    $select.append($('<option>').val(this.id).text(this.nm).attr('data-isi', this.isi));
                });
                $grid.find('tbody > tr').removeClass('selected');
                $row.addClass('selected');
                $grid.children('tbody').append($row);
                $row.find('input[data-field="purch_qty"]').focus();
            }
            local.normalizeItem();
        },
        format: function(n) {
            return $.number(n, 0);
        },
        normalizeItem: function() {
            var total = 0.0;
            $('#detail-grid > tbody > tr').each(function() {
                var $row = $(this);
                var q = $row.find('input[data-field="purch_qty"]').val();
                q = q == '' ? 1 : q;
                var isi = 1; //$row.find('[data-field="id_uom"] > :selected').data('isi');
                isi = isi ? isi : 1;
                var t = isi * q * $row.find('input[data-field="purch_price"]').val();
                $row.find('span.total-price').text(local.format(t));
                $row.find('input[data-field="total_price"]').val(t);
                total += t;
            });
            $('#purchasehdr-purchase_value').val(total);
            $('#total-price').text(local.format(total));
        },
        showDiscount: function() {
            var purch_val = $('#purchasehdr-purchase_value').val();
            var disc_val = $('#purchasehdr-item_discount').val();
            if (disc_val * 1 != 0) {
                $('#bfore').show();
                var disc_val = purch_val * disc_val * 0.01;
                $('#purchase-val').text($.number(purch_val, 0));
                $('#disc-val').text($.number(disc_val, 0));
                $('#total-price').text($.number((purch_val - disc_val), 0));
            } else {
                $('#total-price').text($.number(purch_val, 0));
                $('#bfore').hide();
            }
        },
        searchProductByCode: function(cd) {
            if (biz.master.barcodes[cd]) {
                var id = biz.master.barcodes[cd] + '';
                if (biz.master.product[id]) {
                    return biz.master.product[id];
                }
            }
            return false;
        },
        onProductChange: function() {
            var item = local.searchProductByCode(this.value);
            if (item !== false) {
                local.addItem(item);
            }
            this.value = '';
            $(this).autocomplete("close");
        },
        initRow: function() {
            $('#detail-grid > tbody > tr').each(function() {
                var $row = $(this);
                var product = biz.master.product[$row.find('[data-field="id_product"]').val()];
                if (product) {
                    $row.find('[data-field="id_uom"] > option').each(function() {
                        var $opt = $(this);
                        var isi = product.uoms[$opt.val()].isi;
                        $opt.attr('data-isi', isi);
                        //$opt.data('isi',isi);
                    });
                }
                counter++;
            });
            local.normalizeItem();
        },
        initObj: function() {
            $grid = $('#detail-grid');
            $form = $('#purchase-form');
            template = $('#detail-grid > tbody').data('template');
        },
        initEvent: function() {
            $grid.on('click', '[data-action="delete"]', function() {
                $(this).closest('tr').remove();
                local.normalizeItem();
                return false;
            });
            $grid.on('click', 'tr', function() {
                $grid.find('tbody > tr').removeClass('selected');
                $(this).addClass('selected');
            });
            $grid.on('keydown', ':input[data-field]', function(e) {
                if (e.keyCode == 13) {
                    var $this = $(this);
                    var $inputs = $this.closest('tr').find(':input:visible[data-field]');
                    var idx = $inputs.index(this);
                    if (idx >= 0) {
                        if (idx < $inputs.length - 1) {
                            $inputs.eq(idx + 1).focus();
                        } else {
                            $('#product').focus();
                        }
                    }
                }
            });
            $grid.on('change', ':input[data-field]', function() {
                var $row = $(this).closest('tr');
                var isi = $row.find('[data-field="id_uom"] > :selected').data('isi');
                var p = $row.find('input[data-field="purch_price"]').val();
                var m = $row.find('input[data-field="markup_price"]').val();
                var s = $row.find('input[data-field="selling_price"]').val();
                switch ($(this).data('field')) {
                    case 'markup_price':
                    case 'id_uom':
                        var s = (1.0 * p / isi) / (1 - 0.01 * m);
                        $row.find('input[data-field="selling_price"]').val(s.toFixed(2));
                        break;
                    case 'purch_price':
                    case 'selling_price':
                        var m = s > 0 ? 100 * (s - (1.0 * p / isi)) / s : 0;
                        $row.find('input[data-field="markup_price"]').val(m.toFixed(2));
                        break;
                }
                local.normalizeItem();
            });
            var clicked = false;
            $grid.on('click focus', 'input[data-field]', function(e) {
                if (e.type == 'click') {
                    clicked = true;
                } else {
                    if (!clicked) {
                        $(this).select();
                    }
                    clicked = false;
                }
            });

            $('#product').change(local.onProductChange);
            $('#product').focus();

            local.showDiscount();
            $('#purchasehdr-item_discount').change(local.showDiscount);

            $(window).keydown(function(event) {
                if (event.keyCode == 13) {
                    var $target = $(event.target);
                    if ($target.is('#product') || $target.is('#purchasehdr-item_discount')) {
                        $target.change();
                    } else {
                        event.preventDefault();
                    }
                    return false;
                }
            });

        }
    }

    var pub = {
        sourceSupplier: biz.master.supp,
        init: function() {
            local.initObj();
            local.initRow();
            local.initEvent();
            yii.numeric.input($grid, 'input[data-field]');
        },
        onProductSelect: function(event, ui) {
            local.addItem(ui.item);
        },
        onSupplierSelect: function(event, ui) {
            $('#id_supplier').val(ui.item.id);
        },
        onSupplierOpen: function(event, ui) {
            $('#id_supplier').val('');
        }
    };
    return pub;
})(window.jQuery);
