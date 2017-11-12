<?php

namespace app\modules\admin\models;

use Yii;

/**
 * This is the model class for table "accounts_user_groups_entry".
 *
 * @property integer $account_id
 * @property integer $group_id
 */
class AccountsUserGroupsEntry extends \app\modules\admin\models\Accounts
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'accounts_user_groups_entry';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['account_id', 'group_id'], 'required'],
            [['account_id', 'group_id'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'account_id' => 'Account ID',
            'group_id' => 'Group ID',
        ];
    }

    /**
     * @inheritdoc
     * @return AccountsUserGroupsEntryQuery the active query used by this AR class.
     */
    public static function find()
    {
        return new AccountsUserGroupsEntryQuery(get_called_class());
    }

    public function getGroupName(){
        return  $this->hasOne(AccountsUserGroups::className(),['id'=>'group_id']);
    }
}
