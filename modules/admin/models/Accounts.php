<?php

namespace app\modules\admin\models;

use Yii;

/**
 * This is the model class for table "accounts".
 *
 * @property integer $id
 * @property string $username
 * @property string $password
 * @property string $pin
 * @property string $user_type
 * @property integer $enabled
 * @property string $first_name
 * @property string $last_name
 * @property string $date_last_visited
 */
class Accounts extends \yii\db\ActiveRecord
{
  
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'accounts';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['username', 'password', 'pin', 'user_type', 'first_name', 'last_name', 'date_last_visited'], 'required'],
            [['enabled'], 'integer'],
            [['date_last_visited'], 'safe'],
            [['username', 'password', 'pin'], 'string', 'max' => 50],
            [['user_type'], 'string', 'max' => 1],
            [['first_name', 'last_name'], 'string', 'max' => 30],
            [['username'], 'unique'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'username' => 'Username',
            'password' => 'Password',
            'pin' => 'Pin',
            'user_type' => 'User Type',
            'enabled' => 'Enabled',
            'first_name' => 'First Name',
            'last_name' => 'Last Name',
            'date_last_visited' => 'Date Last Visited',
        ];
    }

    public function getFullName(){
        return $this->first_name." ".$this->last_name;
    }

    public function getAccountsSetting(){
        return $this->hasOne(AccountsSettings::className(),['id'=>'id']);
    }

    public function getGroups(){
        return $this->hasMany(AccountsUserGroupsEntry::className(),['account_id'=>'id']);
    }
}
