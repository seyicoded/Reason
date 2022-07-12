const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');
const { sendMail, getOnlineStatus, getDistanceInMeter } = require('../../resource/general');

const { initPusher } = require('../../resource/general');

const pusherObject = initPusher()

const getMarriageRegStatus = async (req, res)=>{
    // check if marriage entry exist, if not, then return marriage entry not entered
    // if it exist, check if it's completely filled

    try {
        const user_id = (await req.user).u_id;

        const marriage = (await db.promise().query("SELECT * FROM marriage WHERE u_id = ?", [user_id]))[0]

        let msg = '';

        if(marriage.length > 0){
            const _marriage =marriage[0];

            if(_marriage.m_status == 1){
                msg = 'marriage entry filled';
            }else{
                msg = 'marriage entry not fully filled, fill again';
            }

            return res.status(200).json({
                status: true,
                message: msg,
                data: _marriage,
            })
        }else{
            msg = 'marriage entry not filled yet'

            return res.status(200).json({
                status: false,
                message: msg
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

const fillForm = async (req, res)=>{
    // check if marriage entry exist, if not, then return marriage entry not entered
    // if it exist, check if it's completely filled

    try {
        const user_id = (await req.user).u_id;

        const {
            is_anonymous,
            marital_status,
            pm_country,
            pm_state,
            dob,
            has_kids,
            kids,
            want_kids,
            accept_other_kids,
            could_adopt,
            family_type,
            family_size,
            accomodate_other_family,
            raised_by,
            partner_contribution_preference,
            salary_range,
            partner_height,
            domestic_work,
            health_condition,
            blood_group,
            genotype
        } = req.body

        const marriage = (await db.promise().query("SELECT * FROM marriage WHERE u_id = ?", [user_id]))[0]

        let msg = '';

        if(marriage.length > 0){
            // check if data is already created, if so, update it

            let sql = "UPDATE marriage SET is_anonymous = ?, marital_status = ?, pm_country = ?, pm_state = ?, dob = ?, has_kids = ?, kids = ?, want_kids = ?, accept_other_kids = ?, could_adopt = ?, family_type = ?, family_size = ?, accomodate_other_family = ?, raised_by = ?, partner_contribution_preference = ?, salary_range = ?, partner_height = ?, domestic_work = ?, health_condition = ?, blood_group = ?, genotype = ? WHERE u_id = ?";
            const result = (await db.promise().query(sql, [is_anonymous, marital_status, pm_country, pm_state, dob, has_kids, kids, want_kids, accept_other_kids, could_adopt, family_type, family_size, accomodate_other_family, raised_by, partner_contribution_preference, salary_range, partner_height, domestic_work, health_condition, blood_group, genotype, user_id]))[0];

            if(result.affectedRows == 1){
                return res.status(200).json({
                    status: true,
                    message: 'Form filled successfully',
                })
            }else{
                return res.status(200).json({
                    status: false,
                    message: 'An error occurred'
                })
            }
        }else{
            // create data

            // affectedRows = 0 if already exist, 1 if not exist

            let sql = "INSERT INTO `marriage` (`u_id`, `is_anonymous`, `marital_status`, `pm_country`, `pm_state`, `dob`, `has_kids`, `kids`, `want_kids`, `accept_other_kids`, `could_adopt`, `family_type`, `family_size`, `accomodate_other_family`, `raised_by`, `partner_contribution_preference`, `salary_range`, `partner_height`, `domestic_work`, `health_condition`, `blood_group`, `genotype`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            let params = [user_id, is_anonymous, marital_status, pm_country, pm_state, dob, has_kids, kids, want_kids, accept_other_kids, could_adopt, family_type, family_size, accomodate_other_family, raised_by, partner_contribution_preference, salary_range, partner_height, domestic_work, health_condition, blood_group, genotype, 1];
            const result = (await db.promise().query(sql, params))[0];

            if(result.affectedRows == 1){
                return res.status(200).json({
                    status: true,
                    message: 'Form filled successfully',
                })
            }else{
                return res.status(200).json({
                    status: false,
                    message: 'An error occurred'
                })
            }
        }
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

const getList = async (req, res)=>{
    try {
        const user_id = (await req.user).u_id;

        const marriage = (await db.promise().query("SELECT * FROM marriage WHERE u_id = ?", [user_id]))[0]
        const myData = (await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id = ?", [user_id]))[0][0];

        if(marriage.length > 0){
            const _marriage = marriage[0];
            // filter for compatability

            const peopleMarriageData = (await db.promise().query(`SELECT * FROM marriage WHERE is_anonymous = 0 AND (marital_status LIKE '%${_marriage.marital_status}%') AND (pm_country LIKE '%${_marriage.pm_country}%') AND (pm_state LIKE '%${_marriage.pm_state}%') AND (dob LIKE '%${_marriage.dob}%') AND (has_kids LIKE '%${_marriage.has_kids}%') AND (want_kids LIKE '%${_marriage.want_kids}%') AND (accept_other_kids LIKE '%${_marriage.accept_other_kids}%') AND (could_adopt LIKE '%${_marriage.could_adopt}%') AND (family_type LIKE '%${_marriage.family_type}%') AND (partner_height LIKE '%${_marriage.partner_height}%') AND (health_condition LIKE '%${_marriage.health_condition}%') AND (health_condition LIKE '%${_marriage.health_condition}%') AND (blood_group LIKE '%${_marriage.blood_group}%') AND (genotype LIKE '%${_marriage.genotype}%') AND u_id != u_id`, [user_id]))[0]
            // const peopleMarriageDataLength = peopleMarriageData.length;
            
            let peopleMarriage = [];
            for (const key in peopleMarriageData) {
                if (Object.hasOwnProperty.call(peopleMarriageData, key)) {
                    const item = peopleMarriageData[key];
                    
                    const personData = (await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id = ?", [item.u_id]))[0][0];
                    const personMedia = (await db.promise().query("SELECT * FROM user_medias WHERE u_id = ?", [item.u_id]))[0];
                    const marriageData = {
                        u_id: item.u_id,
                        is_anonymous: item.is_anonymous,
                        marital_status: item.marital_status,
                        pm_country: item.pm_country,
                        pm_state: item.pm_state,
                        dob: item.dob,
                        has_kids: item.has_kids,
                        kids: item.kids,
                        want_kids: item.want_kids,
                        accept_other_kids: item.accept_other_kids,
                        could_adopt: item.could_adopt,
                        family_type: item.family_type,
                        family_size: item.family_size,
                        accomodate_other_family: item.accomodate_other_family,
                        raised_by: item.raised_by,
                        partner_contribution_preference: item.partner_contribution_preference,
                        salary_range: item.salary_range,
                        partner_height: item.partner_height,
                        domestic_work: item.domestic_work,
                        health_condition: item.health_condition,
                        blood_group: item.blood_group,
                        genotype: item.genotype,
                        status: item.status,
                    }

                    // get online status
                    const isOnline = getOnlineStatus(pusherObject, item.u_id)
                    const distanceBetweenMe = getDistanceInMeter({
                        lat: myData.lat,
                        lon: myData.lng
                    }, {
                        lat: personData.lat,
                        lon: personData.lng
                    });

                    // return {
                        // personData,
                        // personMedia,
                        // marriageData,
                        // isOnline,
                        // distanceBetweenMe,
                    // }

                    peopleMarriage.push({
                        personData,
                        personMedia,
                        marriageData,
                        isOnline,
                        distanceBetweenMe,
                        unit: 'meter'
                    })
                }
            }

            // const peopleMarriage = peopleMarriageData.map(item=>{
            //     const personData = (await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id = ?", [item.u_id]))[0][0];
            //     const personMedia = (await db.promise().query("SELECT * FROM user_medias WHERE u_id = ?", [item.u_id]))[0];
            //     const marriageData = {
            //         u_id: item.u_id,
            //         is_anonymous: item.is_anonymous,
            //         marital_status: item.marital_status,
            //         pm_country: item.pm_country,
            //         pm_state: item.pm_state,
            //         dob: item.dob,
            //         has_kids: item.has_kids,
            //         kids: item.kids,
            //         want_kids: item.want_kids,
            //         accept_other_kids: item.accept_other_kids,
            //         could_adopt: item.could_adopt,
            //         family_type: item.family_type,
            //         family_size: item.family_size,
            //         accomodate_other_family: item.accomodate_other_family,
            //         raised_by: item.raised_by,
            //         partner_contribution_preference: item.partner_contribution_preference,
            //         salary_range: item.salary_range,
            //         partner_height: item.partner_height,
            //         domestic_work: item.domestic_work,
            //         health_condition: item.health_condition,
            //         blood_group: item.blood_group,
            //         genotype: item.genotype,
            //         status: item.status,
            //     }

            //     // get online status
            //     const isOnline = getOnlineStatus(pusherObject, item.u_id)
            //     const distanceBetweenMe = getDistanceInMeter({
            //         lat: myData.lat,
            //         lon: myData.lng
            //     }, {
            //         lat: personData.lat,
            //         lon: personData.lng
            //     });

            //     return {
            //         personData,
            //         personMedia,
            //         marriageData,
            //         isOnline,
            //         distanceBetweenMe,
            //     }
            // })

            // return data
            return res.status(200).json({
                status: true,
                message: 'List fetched successfully',
                data: peopleMarriage,
            })
        }else{
            return res.status(200).json({
                status: false,
                message: 'Marriage form is required'
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

module.exports = {
    getMarriageRegStatus,
    fillForm,
    getList
}