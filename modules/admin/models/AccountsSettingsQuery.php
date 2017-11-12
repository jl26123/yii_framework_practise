<?php

namespace app\modules\admin\models;

/**
 * This is the ActiveQuery class for [[AccountsSettings]].
 *
 * @see AccountsSettings
 */
class AccountsSettingsQuery extends \yii\db\ActiveQuery
{
    /*public function active()
    {
        return $this->andWhere('[[status]]=1');
    }*/

    /**
     * @inheritdoc
     * @return AccountsSettings[]|array
     */
    public function all($db = null)
    {
        return parent::all($db);
    }

    /**
     * @inheritdoc
     * @return AccountsSettings|array|null
     */
    public function one($db = null)
    {
        return parent::one($db);
    }
}
