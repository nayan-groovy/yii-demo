<?php

use yii\helpers\Html;

/**
 * @var yii\web\View $this
 * @var biz\models\SalesHdr $model
 */
$this->title = 'Create Sales Hdr';
$this->params['breadcrumbs'][] = ['label' => 'Sales Hdrs', 'url' => ['index']];
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="sales-hdr-create">
    <h1><?= Html::encode($this->title) ?></h1>      
    <?php
    echo $this->render('_form', [
        'payment_methods' => $payment_methods,
        'cashDrawer' => $cashDrawer,
        'masters' => $masters
    ]);
    ?>

</div>
