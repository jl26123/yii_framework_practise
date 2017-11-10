<?php

namespace app\modules\admin\models;

/**
 * This is the ActiveQuery class for [[AccountsUserGroups]].
 *
 * @see AccountsUserGroups
 */
class AccountsUserGroupsQuery extends \yii\db\ActiveQuery
{
    /*public function active()
    {
        return $this->andWhere('[[status]]=1');
    }*/

    /**
     * @inheritdoc
     * @return AccountsUserGroups[]|array
     */
    public function all($db = null)
    {
        return parent::all($db);
    }

    /**
     * @inheritdoc
     * @return AccountsUserGroups|array|null
     */
    public function one($db = null)
    {
        return parent::one($db);
    }
}
