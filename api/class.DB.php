<?php

    class DB {

        private $db = false;
        private $qa = false;

        public function __construct() {
            $this->db = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
        }

        public function __destruct() {
            $this->db->close();
        }

        public function setQA($value) {
            $this->qa = $value;
        }

        public function connected() {
            if (!$this->db) {
                return false;
            }
            if ($this->db->connect_error) {
                return false;
            }
          return true;
        }

        public function validateKey($gameKey) {
            if (!KEY_VALIDATION) {
                return true;
            }
            $escGameKey = $this->db->real_escape_string($gameKey);
            $qry = 'SELECT gameKey FROM '.DB_KEY_CHECK.' WHERE gameKey="'.$escGameKey.'";';
            $result = $this->db->query($qry);
            if ($result->num_rows == 1) {
                return true;
            }
          return false;
        }

        public function insertJot($jot) {
            $ret                = 0;
            $prep               = array();

            //Uncomment this if you want to also want to save the Local Time Stamp, server time is always used
            // if($this->db->real_escape_string($jot['localTimestamp']) != ''){
            //   $prep['localLogTimestamp'] = '"'.$this->db->real_escape_string($jot['localTimestamp']).'"';
            // }

            $prep['gameKey']    = '"'.$this->db->real_escape_string($jot['gameKey']).'"';
            $prep['userID']     = '"'.$this->db->real_escape_string($jot['userID']).'"';
            $prep['writer']     = '"'.$this->db->real_escape_string($jot['writer']).'"';
            $prep['gameTime']   = $this->db->real_escape_string($jot['gameTime']);
            $prep['gameCode']   = $this->db->real_escape_string($jot['gameCode']);

            $tblName            = $this->getAppTable( $jot['gameKey'] );

            foreach ($jot as $key => $value) {
                if (substr($key, 0, 1) == 'd' && $key != 'dns') {
                    $ret++;
                    $prep[$key] = '"'.$this->db->real_escape_string($value).'"';
                }
            }

            $qry  = 'INSERT INTO '.$tblName.' ';
            $qry .= '('.implode(", ", array_keys($prep)).')';
            $qry .= ' VALUES ('.implode(", ", $prep).');';
            $result = $this->db->query($qry);

            if (!$result) {
                $ret = -1;
            }
          return $ret;
        }

        public function insertJots($jots, $gk, $uid) {
            $receipt            = array();
            $starttime          = time();
            $contLog            = true;
            $sucRes             = false;
            $tblName            = $this->getAppTable( $gk );

            foreach ($jots as $jot) {

                if ($contLog && time() - $starttime > ini_get('max_execution_time')*0.67) {
                    $contLog    = false;
                    $sucRes     = false;
                }

                if ($contLog) {
                    $prep = array();

                    //Uncomment this if you want to also want to save the Local Time Stamp, server time is always used
                    // if($this->db->real_escape_string($jot['localTimestamp']) != ''){
                    //   $prep['localLogTimestamp'] = '"'.$this->db->real_escape_string($jot['localTimestamp']).'"';
                    // }

                    $prep['gameKey']        = '"'.$this->db->real_escape_string($gk).'"';
                    $prep['userID']         = '"'.$this->db->real_escape_string($uid).'"';
                    $prep['jotID']          = $this->db->real_escape_string($jot->id);
                    $prep['writer']         = '"'.$this->db->real_escape_string($jot->writer).'"';
                    $prep['gameTime']       = $this->db->real_escape_string($jot->gameTime);
                    $prep['gameCode']       = $this->db->real_escape_string($jot->gameCode);

                    foreach ($jot as $key => $value) {
                        if (substr($key, 0, 1) == 'd' && $key != 'dns') {
                            $prep[$key]     = '"'.$this->db->real_escape_string($value).'"';
                        }
                    }

                    $qry                = 'INSERT INTO '.$tblName.' ';
                    $qry                .= '('.implode(", ", array_keys($prep)).')';
                    $qry                .= ' VALUES ('.implode(", ", $prep).');';
                    $result             = $this->db->query($qry);
                    $sucRes             = $result;
                }

                $jotRec                 = array();
                $jotRec['jotID']        = $jot->id;
                $jotRec['success']      = $sucRes;

                array_push( $receipt, $jotRec );
            }

            return $receipt;
        }

        public function getAppTable( $gk ){
            $tbl    = false;
            $q      = "SELECT gameTable from games where gameKey = '".$gk."'";
            $r      = $this->db->query($q);
            $d      = $r->fetch_assoc();
            $tbl    = $d['gameTable'];
            return $tbl;
        }

        public function getMaxPostSize() {
            $val = trim(ini_get('post_max_size'));
            $last = strtolower($val[strlen($val)-1]);
            switch($last) {
                // The 'G' modifier is available since PHP 5.1.0
                case 'g':
                    $val *= 1024;
                case 'm':
                    $val *= 1024;
                case 'k':
                    $val *= 1024;
            }
          return $val;
        }
    }
