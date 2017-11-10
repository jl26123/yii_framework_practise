<?php

namespace app\modules\admin\models;

use Yii;


/**
 * This is the model class for table "accounts_settings".
 *
 * @property integer $id
 * @property integer $task_cap
 * @property integer $part_time
 * @property integer $primary_task_user
 * @property integer $color_map
 * @property string $signature
 * @property string $phone_ip_address
 * @property integer $phone_extension
 */
class AccountsSettings extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'accounts_settings';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['task_cap', 'part_time', 'primary_task_user', 'color_map', 'phone_extension'], 'integer'],
            [['signature', 'phone_ip_address', 'phone_extension'], 'required'],
            [['signature'], 'string', 'max' => 100],
            [['phone_ip_address'], 'string', 'max' => 50],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'task_cap' => 'Determines how many tasks a day they get.',
            'part_time' => 'allowed to have tasks pushed back or not',
            'primary_task_user' => 'Primary Task User',
            'color_map' => 'Color Map',
            'signature' => 'Signature',
            'phone_ip_address' => 'Phone Ip Address',
            'phone_extension' => 'Phone Extension',
        ];
    }

    /**
     * @inheritdoc
     * @return AccountsSettingsQuery the active query used by this AR class.
     */
    public static function find()
    {
        return new AccountsSettingsQuery(get_called_class());
    }
}
