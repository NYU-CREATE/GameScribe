<?php

	class GameScribe_Connection {

		private $db;
		private $dbName = 'gamescribe';
		private $userRW = 'DBuserNameGoesHere';
		private $pwRW	= 'DBpasswordGoesHere';
		private $logTable = 'scribelog';

		public function _construct() {
			$this->db = new mysqli('localhost', $this->userRW, $this->pwRW, $this->dbName);
		}

		public function sendToScribelog($key, $uID, $writer, $gTime, $dCode, $dValues) {
			$this->db = new mysqli('localhost', $this->userRW, $this->pwRW, $this->dbName);

			$dVal_array = explode(':-:', $dValues);
			$dVal_head = '';
			$dVal_val = '';
			for ($i = 1; $i <= count($dVal_array); $i++) {
				$dVal_head .= 'd0' . $i;
				$val = str_replace('~', '\,', $dVal_array[$i-1]);
				$dVal_val .= '"' . $val . '"';
				if ($i < count($dVal_array)) {
					$dVal_head .= ', ';
					$dVal_val .= ', ';
				}
			}

			$this->logTable 	= $this->getAppTable( $key );

			$qryString  = 'INSERT INTO ' . $this->logTable . ' (gameKey, userID, writer, gameTime, gameCode, ' . $dVal_head . ') VALUES (';
			$qryString .= ' "' . $key . '",';
			$qryString .= ' "' . $uID . '",';
			$qryString .= ' "' . $writer . '",';
			$qryString .= ' ' . $gTime . ',';
			$qryString .= ' ' . $dCode . ',';
			$qryString .= ' ' . $dVal_val . ');';

			$result = $this->db->query($qryString);
			return $this->db->insert_id;
		}

		public function getDb() {
			return $this->db;
		}

		public function closeDb() {
			$this->db->close();
		}

		public function getAppTable( $gk ){
            $tbl    = false;
            $q      = "SELECT gameTable from games where gameKey = '".$gk."'";
            $r      = $this->db->query($q);
            $d      = $r->fetch_assoc();
            $tbl    = $d['gameTable'];
            return $tbl;
        }
	}

?>
