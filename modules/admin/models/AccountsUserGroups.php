<?php

namespace app\modules\admin\models;

use Yii;

/**
 * This is the model class for table "accounts_user_groups".
 *
 * @property integer $id
 * @property string $name
 * @property string $description
 */
class AccountsUserGroups extends \app\modules\admin\models\Accounts
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'accounts_user_groups';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name', 'description'], 'required'],
            [['description'], 'string'],
            [['name'], 'string', 'max' => 50],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'description' => 'Description',
        ];
    }

    /**
     * @inheritdoc
     * @return AccountsUserGroupsQuery the active query used by this AR class.
     */
    public static function find()
    {
        return new AccountsUserGroupsQuery(get_called_class());
    }
}
