<?php

namespace app\models;

/**
 * This is the ActiveQuery class for [[Accounts]].
 *
 * @see Accounts
 */
class AccountsQuery extends \yii\db\ActiveQuery
{
    /*public function active()
    {
        return $this->andWhere('[[status]]=1');
    }*/

    /**
     * @inheritdoc
     * @return Accounts[]|array
     */
    public function all($db = null)
    {
        return parent::all($db);
    }

    /**
     * @inheritdoc
     * @return Accounts|array|null
     */
    public function one($db = null)
    {
        return parent::one($db);
    }
}
