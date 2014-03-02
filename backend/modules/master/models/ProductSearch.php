<?php

namespace backend\modules\master\models;

use yii\base\Model;
use yii\data\ActiveDataProvider;
use backend\modules\master\models\Product;

/**
 * ProductSearch represents the model behind the search form about Product.
 */
class ProductSearch extends Model
{
	public $id_product;
	public $cd_product;
	public $nm_product;
	public $id_category;
	public $create_date;
	public $create_by;
	public $update_date;
	public $update_by;

	public function rules()
	{
		return [
			[['id_product', 'id_category', 'create_by', 'update_by'], 'integer'],
			[['cd_product', 'nm_product', 'create_date', 'update_date'], 'safe'],
		];
	}

	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'id_product' => 'Id Product',
			'cd_product' => 'Cd Product',
			'nm_product' => 'Nm Product',
			'id_category' => 'Id Category',
			'create_date' => 'Create Date',
			'create_by' => 'Create By',
			'update_date' => 'Update Date',
			'update_by' => 'Update By',
		];
	}

	public function search($params)
	{
		$query = Product::find();
		$dataProvider = new ActiveDataProvider([
			'query' => $query,
		]);

		if (!($this->load($params) && $this->validate())) {
			return $dataProvider;
		}

		$this->addCondition($query, 'id_product');
		$this->addCondition($query, 'cd_product', true);
		$this->addCondition($query, 'nm_product', true);
		$this->addCondition($query, 'id_category');
		$this->addCondition($query, 'create_date', true);
		$this->addCondition($query, 'create_by');
		$this->addCondition($query, 'update_date', true);
		$this->addCondition($query, 'update_by');
		return $dataProvider;
	}

	protected function addCondition($query, $attribute, $partialMatch = false)
	{
		$value = $this->$attribute;
		if (trim($value) === '') {
			return;
		}
		if ($partialMatch) {
			$query->andWhere(['like', $attribute, $value]);
		} else {
			$query->andWhere([$attribute => $value]);
		}
	}
}
