<?php

namespace backend\modules\master\models;

/**
 * This is the model class for table "price".
 *
 * @property integer $id_price
 * @property integer $id_branch
 * @property integer $id_product
 * @property integer $id_uom
 * @property string $price
 * @property string $create_date
 * @property integer $create_by
 * @property string $update_date
 * @property integer $update_by
 *
 * @property Uom $idUom
 * @property Branch $idBranch
 * @property Product $idProduct
 */
class Price extends \yii\db\ActiveRecord
{
	/**
	 * @inheritdoc
	 */
	public static function tableName()
	{
		return 'price';
	}

	/**
	 * @inheritdoc
	 */
	public function rules()
	{
		return [
			[['id_branch', 'id_product', 'id_uom', 'price'], 'required'],
			[['id_branch', 'id_product', 'id_uom'], 'integer'],
			[['price'], 'number']
		];
	}

	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'id_price' => 'Id Price',
			'id_branch' => 'Id Branch',
			'id_product' => 'Id Product',
			'id_uom' => 'Id Uom',
			'price' => 'Price',
			'create_date' => 'Create Date',
			'create_by' => 'Create By',
			'update_date' => 'Update Date',
			'update_by' => 'Update By',
		];
	}

	/**
	 * @return \yii\db\ActiveQuery
	 */
	public function getIdUom()
	{
		return $this->hasOne(Uom::className(), ['id_uom' => 'id_uom']);
	}

	/**
	 * @return \yii\db\ActiveQuery
	 */
	public function getIdBranch()
	{
		return $this->hasOne(Branch::className(), ['id_branch' => 'id_branch']);
	}

	/**
	 * @return \yii\db\ActiveQuery
	 */
	public function getIdProduct()
	{
		return $this->hasOne(Product::className(), ['id_product' => 'id_product']);
	}

	public static function UpdatePrice($params)
	{
		$price = self::find([
					'id_branch' => $params['id_branch'],
					'id_product' => $params['id_product'],
		]);

		if (!$price) {
			$price = new self();
			$price->setAttributes([
				'id_branch' => $params['id_branch'],
				'id_product' => $params['id_product'],
				'id_uom' => $params['id_uom'],
					], false);
		}
		$price->price = 1.0*($price->price * $params['old_stock'] + $params['price'] * $params['new_stock']) / ($params['old_stock'] + $params['new_stock']);
		if(!$price->save()){
			throw new \yii\base\UserException(implode(",\n", $price->firstErrors));
		}
		return true;;
	}

	public function behaviors()
	{
		return [
			'timestamp' => [
				'class' => 'backend\components\AutoTimestamp',
			],
			'changeUser' => [
				'class' => 'backend\components\AutoUser',
			]
		];
	}

}
